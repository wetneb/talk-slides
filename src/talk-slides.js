function displaySlide(index)
{
    document.getElementById('pdfscreen').innerHTML =
        '<img src="talks/'+confId+'/big-'+index+'.png" alt="Slide '+(index+1)+'" />';
    document.getElementById('thumbnail-'+index).style.border = '2px solid black';
    if(running && currentSlide != index)
    {
        document.getElementById('thumbnail-'+currentSlide).style.border = '2px solid white';
    }
    
    currentSlide = index;

    onDisplaySlide(index);
}

function loadThumbnails()
{
    var elem = document.getElementById('thumbnails-row');
    var elemContent = '';
    for (var i = 0; (i < nbSlides); i++)
    {
        elemContent += '<td><a onClick="displaySlide('+i
            +')"><img src="talks/'+confId+'/small-'+i
            +'.png" id="thumbnail-'+i+'" style="border: 2px solid white;" /></a></td>';
    }
    elem.innerHTML = elemContent;
}

function scrollThumbnails(index)
{
    document.getElementById('thumbnails').scrollLeft= Math.max(133.33333 * (index-1), 0);
}

function displaySlideWrapper()
{
    displaySlide(this);
    scrollThumbnails(this);
}

function preloadImage()
{
    if(this != "")
    {
    new Image().src = 'talks/'+confId+'/big-'+this+'.png';
    }
}

function updateInterface()
{
    document.getElementById('title').innerHTML = title;
    document.getElementById('author').innerHTML = author;

    document.getElementById('vid').innerHTML =
     '          <video id="talkVideo" poster="img/screen.png" controls>\n'+
     '               <source src="'+videoURI+'" />\n' +
     '           </video>\n';

}

// Long polling

long_xhr = new XMLHttpRequest();
ping_xhr = new XMLHttpRequest();

function testServerRunning()
{
    ping_xhr = new XMLHttpRequest();
    ping_xhr.open('GET', 'live/ping', true);
    ping_xhr.send();
    ping_xhr.onreadystatechange=respawnPolling();
}    

function respawnPolling()
{
    if(ping_xhr.readyState == 4)
    {
        if(ping_xhr.response == 'pong')
        {
            long_xhr = new XMLHttpRequest();
            long_xhr.open('GET', 'live/waitNext', true);
            long_xhr.send();
            long_xhr.onreadystatechange=waitForSlideChange;
        }
    }
}

function waitForSlideChange()
{
    if(running)
    {
        if(long_xhr.readyState == 4)
        {
            var newSlide = long_xhr.response;
            
            if(newSlide >= 0)
            {
               displaySlide(newSlide);
            }
            currentSlide = newSlide;
            testServerRunning();
        }
        
        if(long_xhr.readyState == 0)
        {
            testServerRunning();
        }
    }
}

function getLiveSlides()
{
    // Get initial config
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', 'live/status', true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if(xmlhttp.readyState == 4)
        {
            obj = eval('(' + xmlhttp.response + ')');
            confId = obj.confId;
            nbSlides = obj.nbSlides;
            newSlide = obj.currentSlide;
            title = obj.title;
            author = obj.author;
            running = obj.running;
            
            updateInterface();

            if(newSlide >= 0)
            {
                loadThumbnails();
                displaySlide(newSlide);
            }
        }
    }
}

function setupPopcorn()
{
    // Parse le XML pour obtenir les correspondances
    xmlhttp = new XMLHttpRequest();  
    xmlhttp.open('GET', 'talks/'+confId+'/marks.xml', true);
    xmlhttp.send();
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4)
        {
            xmldoc = xmlhttp.responseXML;
     
            var points = xmldoc.getElementsByTagName('point');
    
            // Initialise Popcorn
            var pop = Popcorn('#talkVideo');
            
            // Register callbacks
            for(i = 0; i < points.length; i++)
            {
                var slideId = points[i].getAttribute('slide');
                var eventTime = points[i].getAttribute('time');
                var endTime = pop.duration();
                if(i != points.length - 1)
                {
                    endTime = points[i+1].getAttribute('time');
                }
                
                pop.code({
                        start: eventTime,
                        end: endTime,
                        onStart: displaySlideWrapper.bind(slideId)
                        });

                if(i > 0)
                {
                    pop.code({
                        start: Math.max(eventTime-4, 0),
                        onStart: preloadImage.bind(slideId)
                        });
                }            
            }
        }
    };                
}

// Code honteusement pompé dans une démo de Popcorn JS (Popcorn 101)
function startPopcorn()
{
document.addEventListener("DOMContentLoaded", function () {
        setupPopcorn();
        }, false);
}

