$(function () {
    
   loadWorld();    

});

function loadWorld(){
    
    var randomRowCount = 5;
 
    $.get( "http://127.0.0.1:8080/map/world/data/?rows=" + randomRowCount, function( latLongPoints ) {
    
    var worldMap = Highcharts.maps['custom/world-continents'];
 
    $('#container').highcharts('Map', {
        title: {
            text: 'World'
        },
        series: [{
            mapData: worldMap      

        },{
            type: 'mappoint',
            data: latLongPoints            
        }]
    });
}); 
}

