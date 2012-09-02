import tornado.ioloop
import tornado.web
import sys

class SlideContext:

    def __init__(self):
        self.slideIdx = -1
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
        self.waitingCallbacks += [cb]


context = SlideContext()

class LiveHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous

    def initialize(self, db):
        self.db = db

    def get(self, command):
        if command == "currentSlide":
            self.write(str(self.db["context"].currentSlide()))
            self.finish()
        elif command == "incr":
            self.db["context"].incrSlide()
            self.write("Incremented.\nNew value is "+str(self.db["context"].currentSlide()))
            self.finish()
        elif command == "waitNext":
            self.db["context"].registerWaiter(self.slideChanged)
        else:
            self.write("Unknown command")

    def slideChanged(self):
            self.write(str(self.db["context"].currentSlide()))
            self.finish()

class RegularHandler(tornado.web.RequestHandler):
    def get(self, filename):
        try:
            print("Opening www/"+filename)
            f = open("www/"+filename)
            print("Done")
            self.write(f.read())
        except IOError as e:
            raise tornado.web.HTTPError(404)



application = tornado.web.Application([
    (r"/live/(.*)", LiveHandler, dict(db = dict(context = context))),
    (r"/(.*)", RegularHandler, dict()),
])

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()

