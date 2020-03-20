var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    
    // >> PART III << 
    var connected = null;
    var channel;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    /*
     * >> PART IV <<
     * Funcion para crear y dibujar el poligono
     * @type type
     */
    var addPolygonToCanvas = function polygon(polyPoints) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(polyPoints[0].x, polyPoints[0].y);
        for (var i = 1; i < polyPoints.length; i++) {
            ctx.lineTo(polyPoints[i].x, polyPoints[i].y);
        }
        var colors = ["Black", "Orange", "Red", "Blue", "Yellow", "Green", "Gray"]
        ctx.closePath();
        ctx.stroke();
        ctx.fillStyle = colors[ Math.floor((Math.random() * 6) + 1)];
        ctx.fill();
    }
    
    
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
            // >> PART III << 
            console.log('Connected: ' + frame);
            
            // >> PART I <<
            // >> PART I << removemos este pedazo de codigo para publicar en el topico
            // >> PART I << stompClient.subscribe('/topic/TOPICXX', function (eventbody) {
            
            // >> PART III << agregamos el canal 
            stompClient.subscribe('/topic/newpoint' + channel, function (eventbody) {
                console.log("Connection: " + channel);
                // >> PART II << alert("Punto x: " + JSON.parse(eventbody.body).x + " Punto y: " + JSON.parse(eventbody.body).y);
                // >> PART II <<
                var pointX = JSON.parse(eventbody.body).x;
                var pointY = JSON.parse(eventbody.body).y;

                var pointToCanvas = new Point(pointX, pointY);

                addPointToCanvas(pointToCanvas);
            });
            
            // >> PART IV <<
            stompClient.subscribe('/topic/newpolygon.' + channel, function (eventbody) {
                console.log("Draw polygon");

                addPolygonToCanvas(JSON.parse(eventbody.body));
            });
            
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            // >> PART III << se inicializa sin canal, es decir desconectado
            connected = false;
            //websocket connection
            
            // >> PART II <<
            /* >> PART III << comentamos
             * can.addEventListener("click", canvasClick = function canvasClick(evt) {
                var pointX = getMousePosition(evt).x;
                var pointY = getMousePosition(evt).y;
                //alert("Punto x: " + pointX + " Punto y: " + pointY);
                stompClient.send("/topic/newpoint.", {}, JSON.stringify({x: pointX, y: pointY}));
            });
            
            connectAndSubscribe();
            
            // >> PART II <<
            can.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            */
        },
        
        /*
         * PART III
         * funcion para conectar a un canal especifico
         */
        connect: function (idConnect) {
            if (!(idConnect.toString() === "")) {
                if (!connected) {
                    channel = idConnect;
                    alert("Se conecto al canal" + channel );
                    var can = document.getElementById("canvas");

                    can.addEventListener("click", canvasClick = function canvasClick(evt) {
                        var pointX = getMousePosition(evt).x;
                        var pointY = getMousePosition(evt).y;
                        
                        //>> PART IV << cambiar el recurso de /topic/ a /app/
                        stompClient.send("/app/newpoint." + channel, {}, JSON.stringify({x: pointX, y: pointY}));
                    });

                    connectAndSubscribe();

                    connected = true;

                    can.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

                    document.getElementById("id").disabled = true;
                } else {
                    alert("Actualmente esta en en canal " + channel);
                }
            } else {
                alert("Debe digitar un canal para conectarse");
            }

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
            // >> PART III <<<
            /*if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
            */
            if (connected) {
                stompClient.disconnect();
                stompClient.unsubscribe(channel);

                stompClient = null;
                alert("Desconexion Exitosa");
                connected = false;
                console.log("Disconnected");

                document.getElementById("id").disabled = false;
                document.getElementById("canvas").removeEventListener("click", canvasClick);
            } else {
                alert("No esta conectado a ningun canal");
            }
        }
    };

})();