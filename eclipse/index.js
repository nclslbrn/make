'use strict'
import style from '../src/sass/project.scss'
import sketch from './eclipse'
import show_hide_info from '../src/js/show-hide-info'

const containerElement = document.body
const loader = document.getElementById('loading')

const P5 = new p5(sketch, containerElement)
document.body.removeChild(loader)

var resizeTimeout;
window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        containerElement.removeChild(containerElement.getElementsByClassName('p5Canvas')[0])
        let P5 = new p5(sketch, containerElement)
    }, 500);
});

show_hide_info();