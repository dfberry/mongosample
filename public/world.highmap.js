$(function () {
   loadWorld();    
});

function loadWorld(){
    
    var rows = $.url().param('rows');     
    var aggregationPipePosition = $.url().param('pos');  ;

    $.get( "http://127.0.0.1:8080/map/world/data/?rows=" + rows + "&pos=" + aggregationPipePosition, function( latLongPoints ) {

        var worldMap = Highcharts.maps['custom/world-continents'];

        $('#container').highcharts('Map', {
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