
(function() {

L.Control.GeoJSONList = L.Control.extend({
	//
	//	Name					Data passed			   Description
	//
	//Managed Events:
	//	item-active				{layer}                fired on 'activeEventList'
	//
	//Public methods:
	//  TODO...
	//
	includes: L.Mixin.Events,

	options: {
		collapsed: false,			//collapse panel list
		position: 'bottomleft',		//position of panel list
		listLabel: 'name',			//GeoJSON property to generate items list
		listSortBy: null,			//GeoJSON property to sort items list, default listLabel

		listItemBuild: null,		//function list item builder

		activeListFromLayer: true,	//enable activation of list item from layer

		activeEventList: 'click',	//event on item list that trigger the fitBounds
		activeEventLayer: 'mouseover',	//event on item list that trigger the fitBounds
		activeClass: 'active',		//css class name for active list items
		activeStyle: {				//style for Active GeoJSON feature
			color:'#00f',
			fillColor:'#fa0',
			weight: 1,
			opacity: 1,
			fillOpacity: 0.6
		},
		style: {
			color:'#00f',
			fillColor:'#08f',
			weight: 1,
			opacity: 1,
			fillOpacity:0.4
		}
	},

	initialize: function(layer, options) {
		L.Util.setOptions(this, options);

		this.options.listSortBy = this.options.listSortBy || this.options.listLabel;

		if(this.options.listItemBuild)
			this._itemBuild = this.options.listItemBuild;

		this._layer = layer;
	},

	onAdd: function (map) {

		this._map = map;
	
		var container = L.DomUtil.create('div', 'geojson-list');

		this._container = container;

		this._list = L.DomUtil.create('div', 'geojson-list-group', container);

		this._initToggle();
	
		this._updateList();

		L.DomEvent
			.on(container, 'mouseover', function (e) {
				map.scrollWheelZoom.disable();
			})
			.on(container, 'mouseout', function (e) {
				map.scrollWheelZoom.enable();
			});			

		map.whenReady(function(e) {
			container.style.height = (e.getSize().y)+'px';
		});

		return container;
	},
	
	onRemove: function(map) {
		map.off('moveend', this._updateList, this);	
	},

	_itemBuild: function(layer) {

		var item = L.DomUtil.create('a','');

		if(layer.feature.properties.hasOwnProperty(this.options.listLabel))
			item.innerHTML = '<span>'+layer.feature.properties[this.options.listLabel]+'</span>';
		else
			item.innerHTML = '<span>&nsp;</span>';

		return item;
	},

	_createItem: function(layer) {

		var that = this,
			item = this._itemBuild.call(this, layer);

		L.DomUtil.addClass(item,'geojson-list-item');

		layer.itemList = item;

		L.DomEvent
			.disableClickPropagation(item)
			.on(item, this.options.activeEventList, L.DomEvent.stop, this)
			.on(item, this.options.activeEventList, function(e) {
				
				that._moveTo( layer );

				that.fire('item-active', {layer: layer });

			}, this)
			.on(item, 'mouseover', function(e) {
				
				L.DomUtil.addClass(e.target, this.options.activeClass);

				layer.setStyle( that.options.activeStyle );

			}, this)
			.on(item, 'mouseout', function(e) {

				L.DomUtil.removeClass(e.target, this.options.activeClass);

				layer.setStyle( that.options.style );

			}, this);

		return item;
	},

	_updateList: function() {
	
		var that = this,
			layers = [],
			sortProp = this.options.listSortBy;

		//TODO SORTby

		this._list.innerHTML = '';
		this._layer.eachLayer(function(layer) {

			layers.push( layer );

			layer.setStyle( that.options.style );

			if(that.options.activeListFromLayer) {
				layer
				.on('mouseover', function(e) {
					
					layer.setStyle( that.options.activeStyle );
					L.DomUtil.addClass(layer.itemList, that.options.activeClass);

				})
				.on('mouseout', function(e) {

					layer.setStyle( that.options.style );
					L.DomUtil.removeClass(layer.itemList, that.options.activeClass);
				});
			}
		});

		layers.sort(function(a, b) {
			var ap = a.feature.properties[sortProp],
				bp = b.feature.properties[sortProp];

			if(ap < bp)
				return -1;
			if(ap > bp)
				return 1;
			return 0;
		});

		for (var i=0; i<layers.length; i++)
			this._list.appendChild( this._createItem( layers[i] ) );
	},

	_initToggle: function () {

		/* inspired by L.Control.Layers */

		var container = this._container;

		//Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		if (!L.Browser.touch) {
			L.DomEvent
				.disableClickPropagation(container);
				//.disableScrollPropagation(container);
		} else {
			L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
		}

		if (this.options.collapsed)
		{
			this._collapse();

			if (!L.Browser.android) {
				L.DomEvent
					.on(container, 'mouseover', this._expand, this)
					.on(container, 'mouseout', this._collapse, this);
			}
			var link = this._button = L.DomUtil.create('a', 'geojson-list-toggle', container);
			link.href = '#';
			link.title = 'List GeoJSON';

			if (L.Browser.touch) {
				L.DomEvent
					.on(link, 'click', L.DomEvent.stop)
					.on(link, 'click', this._expand, this);
			}
			else {
				L.DomEvent.on(link, 'focus', this._expand, this);
			}

			this._map.on('click', this._collapse, this);
			// TODO keyboard accessibility
		}
	},

	_expand: function () {
		this._container.className = this._container.className.replace(' geojson-list-collapsed', '');
	},

	_collapse: function () {
		L.DomUtil.addClass(this._container, 'geojson-list-collapsed');
	},

    _moveTo: function(layer) {
		this._map.fitBounds( layer.getBounds().pad(1) );
    }
});

L.control.geoJsonList = function (options) {
    return new L.Control.GeoJSONList(options);
};


}).call(this);
