import tornado.ioloop
import tornado.web
import sys

live_video_URI = "http://localhost:8000/live.ogg"

class SlideContext:
    def __init__(self):
        self.slideIdx = 0 
        self.running = False
        self.confId = "keller-comptheory"
        self.nbSlides = 5
        self.title = "Default conf"
        self.author = "Default author"
        self.videoURI = live_video_URI 
        self.waitingCallbacks = []

    def currentSlide(self):
        return self.slideIdx

    def setSlide(self, idx):
        self.slideIdx = idx
        for cb in self.waitingCallbacks:
            cb()
        self.waitingCallbacks = []

    def incrSlide(self):
        self.setSlide(self.slideIdx+1)

    def registerWaiter(self, cb):
        self.waitingCallbacks.append(cb)

    def forgetWaiter(self, cb):
        self.waitingCallbacks.remove(cb)


context = SlideContext()

class LiveHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous

    def initialize(self, db):
        self.db = db
        self.registered = False

    def get(self, command):
        if command == "status":
            ctxt = self.db["context"]
            self.write("{ \"confId\": \""+ctxt.confId+
                     "\", \"currentSlide\": \""+str(ctxt.currentSlide())+
                     "\", \"nbSlides\": \""+str(ctxt.nbSlides)+
                     "\", \"title\": \""+ctxt.title+
                     "\", \"author\": \""+ctxt.author+
                     "\", \"videoURI\": \""+ctxt.videoURI+
                     "\", \"running\": \""+str(ctxt.running)+
                     "\" }")
            self.finish()
        elif command == "incr":
            self.db["context"].incrSlide()
            self.write("Incremented.\nNew value is "+str(self.db["context"].currentSlide()))
            self.finish()
        elif command == "set":
            self.db["context"].slideIdx = self.get_argument("i",self.db["context"].slideIdx)
            self.write(str(self.db["context"].currentSlide()))
            self.finish()
        elif command == "waitNext":
            self.db["context"].registerWaiter(self.slideChanged)
            self.registered = True
        elif command == "ping":
            self.write("pong")
            self.finish()
        else:
            self.write("Unknown command")
            self.finish()

    def post(self, command):
        if command == "new":
            ctxt.confId = self.get_argument("conf_id", "new_conf")
            ctxt.currentSlide = 0
            ctxt.nbSlides = self.get_argument("nb_slides", 1)
            ctxt.title = self.get_argument("title", "New conference")
            ctxt.author = self.get_argument("author", "The author")
            ctxt.videoURI = live_video_URI
            ctxt.running = True
    
    def unregisterWaiter(self):
        if self.registered:
            self.db["context"].forgetWaiter(self.slideChanged)
    
    def on_finnish():
        self.unregisterWaiter()

    def on_connection_close(self):
        self.unregisterWaiter() 

    def slideChanged(self):
        self.registered = False
        self.write(str(self.db["context"].currentSlide()))
        self.finish()

application = tornado.web.Application([
    (r"/live/(.*)", LiveHandler, dict(db = dict(context = context))),
    (r"/(.*)", tornado.web.StaticFileHandler, dict(path = "www")),
])

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()

