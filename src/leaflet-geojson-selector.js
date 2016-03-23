
(function() {

L.Control.GeoJSONSelector = L.Control.extend({
	//
	//	Name					Data passed			   Description
	//
	//Managed Events:
	//	change				{layers}               fired after checked item in list
	//
	//Public methods:
	//  TODO...
	//
	includes: L.Mixin.Events,

	options: {
		collapsed: false,				//collapse panel list
		position: 'bottomleft',			//position of panel list
		
		listLabel: 'properties.name',	//GeoJSON property to generate items list
		listSortBy: null,				//GeoJSON property to sort items list, default listLabel
		listItemBuild: null,			//function list item builder
		
		activeListFromLayer: true,		//enable activation of list item from layer
		zoomToLayer: false,
		
		listOnlyVisibleLayers: false,	//show list of item of layers visible in map canvas

		multiple: false,				//active multiple selection
		//TODO

		style: {
			color:'#00f',
			fillColor:'#08f',
			fillOpacity: 0.4,
			opacity: 1,
			weight: 1
		},
		activeClass: 'active',			//css class name for active list items
		activeStyle: {					//style for Active GeoJSON feature
			color:'#00f',
			fillColor:'#fc0',
			fillOpacity: 0.6,
			opacity: 1,
			weight: 1
		},
		selectClass: 'selected',
		selectStyle: {
			color:'#00f',
			fillColor:'#f80',
			fillOpacity: 0.8,
			opacity: 1,
			weight: 1
		}
	},

	initialize: function(layer, options) {
		var opt = L.Util.setOptions(this, options || {});

		this.options.listSortBy = this.options.listSortBy || this.options.listLabel;

		if(this.options.listItemBuild)
			this._itemBuild = this.options.listItemBuild;

		this._layer = layer;
	},

	onAdd: function (map) {

		var container = L.DomUtil.create('div', 'geojson-list');

		this._baseName = 'geojson-list';

		this._map = map;

		this._container = container;

		this._id = this._baseName + L.stamp(this._container);

		this._list = L.DomUtil.create('ul', 'geojson-list-group', container);

		this._items = [];

		L.DomEvent
			.on(container, 'mouseover', function (e) {
				map.scrollWheelZoom.disable();
			})
			.on(container, 'mouseout', function (e) {
				map.scrollWheelZoom.enable();
			});

		if(this.options.listOnlyVisibleLayers)
			map.on('moveend', this._updateListVisible, this);

		map.whenReady(function(e) {
			container.style.height = (map.getSize().y)+'px';
		});

		this._initToggle();
		this._updateList();

		return container;
	},
	
	onRemove: function(map) {
		map.off('moveend', this._updateList, this);	
	},

	reload: function(layer) {

		//TODO off events

		this._layer = layer;

		this._updateList();

		return this;
	},

	_getPath: function(obj, prop) {
		var parts = prop.split('.'),
			last = parts.pop(),
			len = parts.length,
			cur = parts[0],
			i = 1;

		if(len > 0)
			while((obj = obj[cur]) && i < len)
				cur = parts[i++];

		if(obj)
			return obj[last];
	},

	_itemBuild: function(layer) {

		return this._getPath(layer.feature, this.options.listLabel) || '&nbsp;';
	},

	_selectItem: function(item, selected) {

		for (var i = 0; i < this._items.length; i++)
			L.DomUtil.removeClass(this._items[i], this.options.selectClass);

		if(selected)
			L.DomUtil.addClass(item, this.options.selectClass );
	},

	_selectLayer: function(layer, selected) {

		for(var i = 0; i < this._items.length; i++)
			if(this._items[i].layer.setStyle)
				this._items[i].layer.setStyle( this.options.style );
		
		if(selected && layer.setStyle)
			layer.setStyle( this.options.selectStyle );
	},	

	_createItem: function(layer) {

		var that = this,
			item = L.DomUtil.create('li','geojson-list-item'),
			label = document.createElement('label'),
			inputType = this.options.multiple ? 'checkbox' : 'radio',
			input = this._createInputElement(inputType, this._id, false),
			html = this._itemBuild.call(this, layer);

		label.innerHTML = html;
		label.insertBefore(input, label.firstChild);
		item.appendChild(label);

		item.layer = layer;
		layer.itemList = item;
		layer.itemLabel = label;

		L.DomEvent
			//.disableClickPropagation(item)
			.on(label, 'click', L.DomEvent.stop, this)
			.on(label, 'click', function(e) {

				if(that.options.zoomToLayer)
					that._moveTo( layer );
				//TODO zoom to bbox for multiple layers

				input.checked = !input.checked;

				item.selected = input.checked;

				that._selectItem(item, input.checked);
				that._selectLayer(layer, input.checked);		

				that.fire('change', {
					selected: input.checked,					
					layers: [layer]
				});

			}, this);

		L.DomEvent
			.on(item, 'mouseover', function(e) {
				
				L.DomUtil.addClass(e.target, this.options.activeClass);

				for (var i = 0; i < that._items.length; i++)
					if(!that._items[i])
						that._items[i].layer.setStyle( that.options.activeStyle );						

			}, this)
			.on(item, 'mouseout', function(e) {

				L.DomUtil.removeClass(e.target, that.options.activeClass);

				for (var i = 0; i < that._items.length; i++)
					if(!that._items[i])
						that._items[i].layer.setStyle( that.options.style );						

			}, this);

		this._items.push( item );

		return item;
	},

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createInputElement: function (type, name, checked) {

		var radioHtml = '<input type="'+type+'" name="' + name + '"';
		if (checked)
			radioHtml += ' checked="checked"';
		radioHtml += '/>';

		var radioFragment = document.createElement('div');
		radioFragment.innerHTML = radioHtml;

		return radioFragment.firstChild;
	},

	_updateList: function() {
	
		var that = this,
			layers = [],
			sortProp = this.options.listSortBy;

		//TODO SORTby

		//this._list.style.minWidth = '';
		this._list.innerHTML = '';
		this._layer.eachLayer(function(layer) {

			layers.push( layer );

			if(layer.setStyle)
				layer.setStyle( that.options.style );

			if(that.options.activeListFromLayer) {
				layer
				.on('click', L.DomEvent.stop)
				.on('click', function(e) {
					layer.itemLabel.click();
				})
				.on('mouseover', function(e) {
	
					if(layer.setStyle)
						layer.setStyle( that.options.activeStyle );

					L.DomUtil.addClass(layer.itemList, that.options.activeClass);
				})
				.on('mouseout', function(e) {

					if(layer.setStyle)
						layer.setStyle( that.options.style );

					L.DomUtil.removeClass(layer.itemList, that.options.activeClass);
				});
			}
		});

		layers.sort(function(a, b) {
			var ap = that._getPath(a.feature, sortProp),
				bp = that._getPath(b.feature, sortProp);

			if(ap < bp)
				return -1;
			if(ap > bp)
				return 1;
			return 0;
		});

		for (var i=0; i<layers.length; i++)
			this._list.appendChild( this._createItem( layers[i] ) );
	},

	_updateListVisible: function() {

		var that = this,
			layerbb, visible;
		
		this._layer.eachLayer(function(layer) {

			if(layer.getBounds)
				visible = that._map.getBounds().intersects( layer.getBounds() );
			else if(layer.getLatLng)
				visible = that._map.getBounds().contains( layer.getLatLng() );

			layer.itemList.style.display = visible ? 'block':'none';
		});
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

    	var pos = this.options.position,
    		w = this._map._controlCorners[ pos ].clientWidth;

		var psize = new L.Point(
				this._container.clientWidth,
				this._container.clientHeight),
			fitOpts = {
				paddingTopLeft: null,
				paddingBottomRight: null
			};

/*var ne = this._map.containerPointToLatLng( L.point(psize.x, 0) ),
	sw = this._map.containerPointToLatLng( L.point(msize.x, psize.y) ),
	bb = L.latLngBounds(sw, ne);
*/
/*L.rectangle(bb).addTo(this._map);
L.marker(bb.getCenter()).addTo(this._map);
*/

		if (pos.indexOf('right') !== -1) {
			fitOpts.paddingBottomRight = L.point(psize.x, 0);
		}
		else if (pos.indexOf('left') !== -1) {
			fitOpts.paddingTopLeft = L.point(psize.x, 0);
		}

    	if(layer.getBounds)
			this._map.fitBounds(layer.getBounds(), fitOpts);

		else if(layer.getLatLng)
			this._map.setView( layer.getLatLng() );

    }
});

L.control.geoJsonSelector = function (layer, options) {
    return new L.Control.GeoJSONSelector(layer, options);
};


}).call(this);
