
(function() {

L.Control.GeoJSONList = L.Control.extend({

	includes: L.Mixin.Events,

	options: {		
		layer: false,
		collapsed: false,		
		label: 'name',
		//TODO sortBy: 'name',
		zoomOn: 'click',		//event on list item that trigger the fitBounds
		itemArrow: '&#10148;',	//arrow icon
		position: 'bottomleft'
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._container = null;
		this._list = null;
		this._layer = this.options.layer;
	},

	onAdd: function (map) {

		this._map = map;
	
		var container = this._container = L.DomUtil.create('div', 'geojson-list');

		this._list = L.DomUtil.create('ul', 'geojson-list-ul', container);

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
		this._container = null;
		this._list = null;		
	},

	_createItem: function(layer) {

		var li = L.DomUtil.create('li', 'geojson-list-li'),
			a = L.DomUtil.create('a', '', li),
			that = this;

		a.href = '#';
		L.DomEvent
			.disableClickPropagation(a)
			.on(a, this.options.zoomOn, L.DomEvent.stop, this)
			.on(a, this.options.zoomOn, function(e) {
				this._moveTo( layer );
			}, this)
			.on(a, 'mouseover', function(e) {
				that.fire('item-mouseover', {layer: layer });
			}, this)
			.on(a, 'mouseout', function(e) {
				that.fire('item-mouseout', {layer: layer });
			}, this);			

		if( layer.feature.properties.hasOwnProperty(this.options.label) )
			a.innerHTML = '<span>'+layer.feature.properties[this.options.label]+'</span> <b>'+this.options.itemArrow+'</b>';
		else
			console.log("propertyName '"+this.options.label+"' not found in feature");

		return li;
	},

	_updateList: function() {
	
		var that = this,
			n = 0;

		this._list.innerHTML = '';
		this._layer.eachLayer(function(layer) {
			if(layer.feature && layer.feature.type && layer.feature.type==='Feature')
				that._list.appendChild( that._createItem(layer) );
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
		this._map.fitBounds( layer.getBounds().pad(1) );
    }
});

L.control.geoJsonList = function (options) {
    return new L.Control.GeoJSONList(options);
};


}).call(this);
