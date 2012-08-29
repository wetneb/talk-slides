function loadThumbnails()
{
    var elem = document.getElementById('thumbnails-row');
    var elemContent = '';
    for (var i = 0; (i < nbSlides); i++)
    {
        elemContent += '<td><a onClick="displaySlide('+i+')"><img src="'+confId+'-small-'+i+'.png" /></a></td>';
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
    xmlhttp.open('GET', 'marques-'+confId+'.xml', true);
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
                pop.code({
                        start: eventTime,
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

