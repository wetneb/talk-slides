#!/bin/sh

avconv -f video4linux2 -i /dev/video0 -c:a pcm_u8 -c:v libtheora -f ogg - | oggfwd localhost 8000 hackme live.ogg


