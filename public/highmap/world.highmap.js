$(function () {
   loadWorld();    
});

function loadWorld(){
    
    var rows = $.url().param('rows');
    if (isNaN(rows)){
        rows=0;
    }     
    var aggregationPipePosition = $.url().param('pos');  ;
    if (isNaN(aggregationPipePosition)){
        aggregationPipePosition=1;
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
                showInLegend: false            
            }]
        });
        
        $('#data').text(JSON.stringify(latLongPoints));
    }); 
}