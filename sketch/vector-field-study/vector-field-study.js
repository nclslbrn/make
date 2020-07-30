/// <reference path="../../node_modules/@types/p5/global.d.ts" />

import * as tome from 'chromotome'
import planeCurveFuncs from './plane-function'

const sketch = (p5) => {
    const res = 0.05
    const scale = 0.01
    const numFrame = 60
    const alpha = 50
    const funcs = planeCurveFuncs(p5)
    let selectedFunc, palette, points

    const planeCurveFunctionSelector = () => {
        const funcSelector = document.createElement('select')
        const lastFunc = Object.keys(funcs).pop()
        // loop through functions in func
        Object.entries(funcs).forEach((func) => {
            // create option for each them
            const funcName = func[0].replace('_', ' ')
            const funcOption = document.createElement('option')
            funcOption.appendChild(document.createTextNode(funcName))
            funcOption.value = func[0]
            // set default function to the last one
            if (lastFunc === func[0]) {
                selectedFunc = func[0]
                funcOption.selected = 'selected'
            }
            funcSelector.appendChild(funcOption)
        })
        document.body.appendChild(funcSelector)
        // change selected function when user change it
        funcSelector.addEventListener('change', (event) => {
            initSketch()
            selectedFunc = funcSelector.value
        })
    }

    const initSketch = () => {
        // get a random palette from chromotome
        palette = tome.get()

        // initialise points positions
        points = []
        for (let x = -3; x <= 3; x += res) {
            for (let y = -3; y <= 3; y += res) {
                points.push(
                    p5.createVector(
                        x + p5.random(1) * res,
                        y + p5.random(1) * res
                    )
                )
            }
        }

        // clear the canvas background
        if (palette.background) {
            p5.background(palette.background)
        } else if (palette.stroke) {
            p5.background(palette.stroke)
        } else {
            p5.background(25, 25, 25)
        }
    }

    const circle = function (theta) {
        return p5.createVector(p5.cos(theta), p5.sin(theta))
    }

    p5.setup = () => {
        p5.createCanvas(800, 800)
        p5.stroke(0)
        planeCurveFunctionSelector()
        initSketch()
    }

    p5.draw = () => {
        const t = (p5.frameCount % numFrame) / numFrame

        for (let p = 0; p < points.length; p++) {
            const xx = p5.map(points[p].x, -6.5, 6.5, 0, p5.width)
            const yy = p5.map(points[p].y, -6.5, 6.5, 0, p5.height)

            const n1 =
                5 * p5.map(p5.noise(points[p].x, points[p].y), 0, 1, -1, 1)
            const v1 = circle(n1)
            const v = funcs[selectedFunc](v1)
            let pointColor = p5.color(p5.random(palette.colors))
            pointColor.setAlpha(alpha)
            p5.stroke(pointColor)
            p5.point(xx, yy)

            points[p].x += scale * v.x
            points[p].y += scale * v.y
        }
    }
    sketch.exportPNG = () => {
        const date = new Date()
        const filename =
            'Vector-field.' +
            date.getFullYear() +
            '-' +
            date.getMonth() +
            '-' +
            date.getDay() +
            '_' +
            date.getHours() +
            '.' +
            date.getMinutes() +
            '.' +
            date.getSeconds() +
            '--copyright_Nicolas_Lebrun_CC-by-3.0'
        p5.save(canvas, filename, 'png')
    }
}

export default sketch