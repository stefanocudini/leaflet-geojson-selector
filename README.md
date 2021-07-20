# leaflet-geojson-selector

[![npm version](https://badge.fury.io/js/leaflet-geojson-selector.svg)](http://badge.fury.io/js/leaflet-geojson-selector)

Show GeoJSON properties in a interactive menu and map

Copyright 2016 [Stefano Cudini](https://opengeo.tech/stefano-cudini/)

Tested in Leaflet 0.7.x, 1.3.x

Licensed under the [MIT](https://opensource.org/licenses/MIT)

![Image](https://raw.githubusercontent.com/stefanocudini/leaflet-geojson-selector/master/images/leaflet-geojson-selector.jpg)

#Where

**Demo online:**  
[opengeo.tech/maps/leaflet-geojson-selector](https://opengeo.tech/maps/leaflet-geojson-selector/)

**Source code:**  
[Github](https://github.com/stefanocudini/leaflet-geojson-selector)  
[NPM](https://npmjs.org/package/leaflet-geojson-selector)


# Options
| Option	            | Default           | Description                               |
| --------------------- | ----------------- | ----------------------------------------- |
| collapsed		        | false			    | collapse panel list                       |
| position		        | 'bottomleft'	    | position of panel list                    |
| listLabel		        | 'properties.name' | GeoJSON property to generate items list   |
| listSortBy	        | 'properties.name' | property to sort items, default is listLabel |
| listItemBuild	        | null              | function list item builder                |
| activeListFromLayer   | true		        | highlight of list item on layer hover     |
| zoomToLayer		    | false             |                                           |
| listOnlyVisibleLayers | false             | show only items visible in map canvas     |
| multiple			    | false             | active multiple selection                 |
| style			        | {}                | style for GeoJSON features                |
| activeClass			| 'active'          | css class name for active list items      |
| activeStyle			|				    | style for Active GeoJSON features         |
| selectClass			| 'selected'        |                                           |
| selectStyle			| {}                | style for Selected GeoJSON features       |

# Events
| Event			         | Data			          | Description                               |
| ---------------------- | ---------------------- | ----------------------------------------- |
| 'selector:change'      | {selected, layers}     | fired after checked item in list, selected is true if any layer is selected |

# Methods
| Method		| Arguments		 | Description                  |
| ------------- | -------------- | ---------------------------- |
| reload()	    | layer	         | search text by external code |


#Build

Since Version 1.4.7 this plugin support [Grunt](https://gruntjs.com/) for building process.
Therefore the deployment require [NPM](https://npmjs.org/) installed in your system.
After you've made sure to have npm working, run this in command line:
```bash
npm install
grunt
```
