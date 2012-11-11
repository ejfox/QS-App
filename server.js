//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , mustache = require('mustache')    
    , port = (process.env.PORT || 8081);

var databaseUrl = "qstest"; // "username:password@example.com/mydb"
var db = require("mongojs").connect(databaseUrl, ['qstest']);


var tmpl = {
    compile: function (source, options) {
        if (typeof source == 'string') {
            return function(options) {
                options.locals = options.locals || {};
                options.partials = options.partials || {};
                if (options.body) // for express.js > v1.0
                    locals.body = options.body;
                return mustache.to_html(
                    source, options.locals, options.partials);
            };
        } else {
            return source;
        }
    },
    render: function (template, options) {
        template = this.compile(template, options);
        return template(options);
    }
};


//Setup Express
var server = express.createServer();

server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
    server.register(".html", tmpl);    
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.html', {
    locals : { 
              title : 'Quantify Yourself'
            }
  });
});


////////////// QS APP CODE


server.get('/newevent', function(req,res){
    console.log("new event");
    var qs = {};
    
    qs.date             = req.query['date'],
    qs.user             = req.query['user'],    
    qs.wakeTime         = req.query['waketime'],
    qs.amMood           = req.query['am-mood'],
    qs.pmMood           = req.query['pm-mood'],
    qs.amRestedness     = req.query['am-restedness'],
    qs.optimism         = req.query['optimism'],
    qs.meditated        = req.query['meditated'],
    qs.showered         = req.query['showered'],
    qs.exerciseTime     = req.query['exercise-time'],
    qs.videoGamesPlayed = req.query['video-games'],
    qs.orgasms          = req.query['orgasms'];        
    
    console.log("qs", qs);    
    
    
    db.qstest.save(qs, function(err, updated) {
        if (err || !updated) console.log("Problem saving")
        else {
            console.log("Added user")
            
            db.qstest.find({user: "user1"}, function(err, cursor){
                console.log("ALLLLL OF DA UPDAAAAATES", cursor)
                
                res.render("list.html", {
                        locals: {
                            eventadded: true,
                            title: "Event added!",
                            checkins: cursor
                        }
                })
            })
            
        }
    });

    
    

});




//////////////







//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
