var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            // >> PART II << console.log('Connected: ' + frame);
            // >> PART I <<
            // >> PART I << removemos este pedazo de codigo para publicar en el topico
            // >> PART I << stompClient.subscribe('/topic/TOPICXX', function (eventbody) {
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                // >> PART II << alert("Punto x: " + JSON.parse(eventbody.body).x + " Punto y: " + JSON.parse(eventbody.body).y);
                // >> PART II <<
                var pointX = JSON.parse(eventbody.body).x;
                var pointY = JSON.parse(eventbody.body).y;

                var pointToCanvas = new Point(pointX, pointY);

                addPointToCanvas(pointToCanvas);
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            //websocket connection
            
            // >> PART II <<
            can.addEventListener("click", canvasClick = function canvasClick(evt) {
                var pointX = getMousePosition(evt).x;
                var pointY = getMousePosition(evt).y;
                //alert("Punto x: " + pointX + " Punto y: " + pointY);
                stompClient.send("/topic/newpoint.", {}, JSON.stringify({x: pointX, y: pointY}));
            });
            
            connectAndSubscribe();
            
            // >> PART II <<
            can.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            // >> PART I <<
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); 
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();