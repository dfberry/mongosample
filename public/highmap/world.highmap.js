$(function () {
   loadWorld();    
});

function loadWorld(){
    
    // count of rows to sample
    var rows = $.url().param('rows');
    if (isNaN(rows)){
        rows=0;
    }     
    
    // position in aggregation pipeline
    var aggregationPipePosition = $.url().param('pos');  
    if (isNaN(aggregationPipePosition)){
        aggregationPipePosition=1;
    }
    
    // how big are point markers on map
    var radius = $.url().param('radius');  
    if (isNaN(radius)){
        radius=3;
    }

    $.get( "http://127.0.0.1:8080/map/data/?rows=" + rows + "&pos=" + aggregationPipePosition, function( latLongPoints ) {

        var worldMap = Highcharts.maps['custom/world-continents'];

        $('#map').highcharts('Map', {
            title: {
                text: 'World'
            },
            series: [{
                mapData: worldMap,
                showInLegend: false      

            },{
                type: 'mappoint',
                data: latLongPoints,
                color: "#000000",
                showInLegend: false,
                "marker": {
                    "radius": radius
                }            
            }]
        });
        $('#data').text(JSON.stringify(latLongPoints));
    }); 
}