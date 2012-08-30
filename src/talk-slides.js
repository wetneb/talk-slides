function displaySlide(index)
{
    document.getElementById('pdfscreen').innerHTML =
        '<img src="talks/'+confId+'/big-'+index+'.png" alt="Slide '+(index+1)+'" />';
    document.getElementById('thumbnail-'+index).style.border = '2px solid black';
    if(currentSlide != -1 && currentSlide != index)
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

