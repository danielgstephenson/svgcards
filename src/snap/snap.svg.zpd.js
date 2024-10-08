/* globals Snap, document, navigator */

/**
 *  snapsvg-zpd.js: A zoom/pan/drag plugin for Snap.svg
 * ==================================================
 *
 *  Usage
 * =======
 * var paper = Snap();
 * var bigCircle = paper.circle(150, 150, 100);
 * paper.zpd();
 *
 * // or settings and callback
 * paper.zpd({ zoom: false }), function (err, paper) { });
 *
 * // or callback
 * paper.zpd(function (err, paper) { });
 *
 * // destroy
 * paper.zpd('destroy');
 *
 * // save
 * paper.zpd('save');
 *
 * // load
 * // paper.zpd({ load: SVGMatrix {} });
 *
 * // origin
 * paper.zpd('origin');
 *
 * // zoomTo
 * paper.zoomTo(1);
 *
 * // panTo
 * paper.panTo(0, 0); // original location
 * paper.panTo('+10', 0); // move right
 *
 * // rotate
 * paper.rotate(15); // rotate 15 deg
 *
 *  Notice
 * ========
 * This usually use on present view only. Not for Storing, modifying the paper.
 *
 * Reason:
 * Usually <pan> <zoom> => <svg transform="matrix(a,b,c,d,e,f)"></svg>
 *
 * But if you need to store the <drag> location, (for storing)
 * we have to use <circle cx="x" cy="y"></circle> not <circle tranform="matrix(a,b,c,d,e,f)"></circle>
 *
 *  License
 * =========
 * This code is licensed under the following BSD license:
 *
 * Copyright 2014 Huei Tan <huei90@gmail.com> (Snap.svg integration). All rights reserved.
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com> (original author). All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 */

SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function (elem) {
  return elem.getScreenCTM().inverse().multiply(this.getScreenCTM())
};

(function (Snap) {
  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    /**
         * Global variable for snap.svg.zpd plugin
         */
    const snapsvgzpd = {
      uniqueIdPrefix: 'snapsvg-zpd-', // prefix for the unique ids created for zpd
      dataStore: {}, // "global" storage for all our zpd elements
      enable: true // By default, snapsvgzpd should enable, zpd('toggle') to toggle enable or disable
    }

    /**
         * Global variable to store root of the svg element
         */
    let rootSvgObject

    /**
         * remove node parent but keep children
         */
    const _removeNodeKeepChildren = function removeNodeKeepChildren (node) {
      if (!node.parentNode) {
        return
      }
      while (node.firstChild) {
        node.parentNode.insertBefore(node.firstChild, node)
      }
      node.parentNode.removeChild(node)
    }

    /**
         * Detect is +1 -1 or 1
         * increase decrease or just number
         */
    const _increaseDecreaseOrNumber = function increaseDecreaseOrNumber (defaultValue, input) {
      if (input === undefined) {
        return parseInt(defaultValue)
      } else if (input[0] == '+') {
        return defaultValue + parseInt(input.split('+')[1])
      } else if (input[0] == '-') {
        return defaultValue - parseInt(input.split('-')[1])
      } else {
        return parseInt(input)
      }
    }

    /**
         * Sets the current transform matrix of an element.
         */
    const _setCTM = function setCTM (element, matrix, threshold) {
      if (threshold && typeof threshold === 'object') { // array [0.5,2]
        const oldMatrix = Snap(element).transform().globalMatrix

        if (matrix.a < oldMatrix.a && matrix.a < threshold[0]) {
          return
        } else if (matrix.a > oldMatrix.a && matrix.a > threshold[1]) {
          return
        }

        if (matrix.d < oldMatrix.d && matrix.d < threshold[0]) {
          return
        } else if (matrix.d > oldMatrix.d && matrix.d > threshold[1]) {
          return
        }
      }
      const s = 'matrix(' + matrix.a + ',' + matrix.b + ',' + matrix.c + ',' + matrix.d + ',' + matrix.e + ',' + matrix.f + ')'
      element.setAttribute('transform', s)
    }

    /**
         * Dumps a matrix to a string (useful for debug).
         */
    const _dumpMatrix = function dumpMatrix (matrix) {
      const s = '[ ' + matrix.a + ', ' + matrix.c + ', ' + matrix.e + '\n  ' + matrix.b + ', ' + matrix.d + ', ' + matrix.f + '\n  0, 0, 1 ]'
      return s
    }

    /**
         * Instance an SVGPoint object with given event coordinates.
         */
    const _findPos = function findPos (obj) {
      let curleft = 0
      let curtop = 0
      if (obj.offsetParent) {
        do {
          curleft += obj.offsetLeft
          curtop += obj.offsetTop
        } while (obj = obj.offsetParent)
      }
      return [curleft, curtop]
    }
    const _getEventPoint = function getEventPoint (event, svgNode) {
      const p = svgNode.node.createSVGPoint()
      const svgPos = _findPos(svgNode.node)

      p.x = event.clientX - svgPos[0]
      p.y = event.clientY - svgPos[1]

      return p
    }

    /**
         * Get an svg transformation matrix as string representation
         */
    const _getSvgMatrixAsString = function _getMatrixAsString (matrix) {
      return 'matrix(' + matrix.a + ',' + matrix.b + ',' + matrix.c + ',' + matrix.d + ',' + matrix.e + ',' + matrix.f + ')'
    }

    /**
         * add a new <g> element to the paper
         * add paper nodes into <g> element (Snapsvg Element)
         * and give the nodes an unique id like 'snapsvg-zpd-12345'
         * and let this <g> Element to global snapsvgzpd.dataStore['snapsvg-zpd-12345']
         * and
         * <svg>
         *     <def>something</def>
         *     <circle cx="10" cy="10" r="100"></circle>
         * </svg>
         *
         * transform to =>
         *
         * <svg>
         *     <g id="snapsvg-zpd-12345">
         *         <def>something</def>
         *         <circle cx="10" cy="10" r="100"></circle>
         *     </g>
         * </svg>
         */
    const _initZpdElement = function initAndGetZpdElement (svgObject, options) {
      // get root of svg object
      rootSvgObject = svgObject.node

      // get all child nodes in our svg element
      const rootChildNodes = svgObject.node.childNodes

      // create a new graphics element in our svg element
      const gElement = svgObject.g()
      const gNode = gElement.node

      // add our unique id to the element
      gNode.id = snapsvgzpd.uniqueIdPrefix + svgObject.id

      // check if a matrix has been supplied to initialize the drawing
      if (options.load && typeof options.load === 'object') {
        const matrix = options.load

        // create a matrix string from our supplied matrix
        const matrixString = 'matrix(' + matrix.a + ',' + matrix.b + ',' + matrix.c + ',' + matrix.d + ',' + matrix.e + ',' + matrix.f + ')'

        // load <g> transform matrix
        gElement.transform(matrixString)
      } else {
        // initial set <g transform="matrix(1,0,0,1,0,0)">
        gElement.transform('matrix')
      }

      // initialize our index counter for child nodes
      let index = 0

      // get the number of child nodes in our root node
      // substract -1 to exclude our <g> element
      const noOfChildNodes = rootChildNodes.length - 1

      // go through all child elements
      // (except the last one, which is our <g> element)
      while (index < noOfChildNodes) {
        gNode.appendChild(rootChildNodes[0])
        index += 1
      }

      // define some data to be used in the function internally
      const data = {
        svg: svgObject,
        root: svgObject.node, // get paper svg
        state: 'none',
        stateTarget: null,
        stateOrigin: null,
        stateTf: null
      }

      // create an element with all required properties
      const item = {
        element: gElement,
        data,
        options
      }

      // create some mouse event handlers for our item
      // store them globally for optional removal later on
      item.handlerFunctions = _getHandlerFunctions(item)

      // return our element
      return item
    }

    /**
         * create some handler functions for our mouse actions
         * we will take advantace of closures to preserve some data
         */
    var _getHandlerFunctions = function getHandlerFunctions (zpdElement) {
      const handleMouseUp = function handleMouseUp (event) {
        if (event.preventDefault) {
          event.preventDefault()
        }

        if (!snapsvgzpd.enable) return

        event.returnValue = false

        if (zpdElement.data.state == 'pan' || zpdElement.data.state == 'drag') {
          // quit pan mode
          zpdElement.data.state = ''
        }
      }

      const handleMouseDown = function handleMouseDown (event) {
        if (event.preventDefault) {
          event.preventDefault()
        }

        if (!snapsvgzpd.enable) return

        event.returnValue = false

        const g = zpdElement.element.node

        if (
          event.target.tagName == 'svg' || !zpdElement.options.drag // Pan anyway when drag is disabled and the user clicked on an element
        ) {
          // Pan mode
          zpdElement.data.state = 'pan'

          zpdElement.data.stateTf = g.getCTM().inverse()

          zpdElement.data.stateOrigin = _getEventPoint(event, zpdElement.data.svg).matrixTransform(zpdElement.data.stateTf)
        } else {
          // Drag mode
          zpdElement.data.state = 'drag'

          zpdElement.data.stateTarget = event.target

          zpdElement.data.stateTf = g.getCTM().inverse()

          zpdElement.data.stateOrigin = _getEventPoint(event, zpdElement.data.svg).matrixTransform(zpdElement.data.stateTf)
        }
      }

      const handleMouseMove = function handleMouseMove (event) {
        if (event.preventDefault) {
          event.preventDefault()
        }

        if (!snapsvgzpd.enable) return

        event.returnValue = false

        const g = zpdElement.element.node

        if (zpdElement.data.state == 'pan' && zpdElement.options.pan) {
          // Pan mode
          const p = _getEventPoint(event, zpdElement.data.svg).matrixTransform(zpdElement.data.stateTf)

          _setCTM(g, zpdElement.data.stateTf.inverse().translate(p.x - zpdElement.data.stateOrigin.x, p.y - zpdElement.data.stateOrigin.y), zpdElement.options.zoomThreshold)
        } else if (zpdElement.data.state == 'drag' && zpdElement.options.drag) {
          // Drag mode
          const dragPoint = _getEventPoint(event, zpdElement.data.svg).matrixTransform(g.getCTM().inverse())

          _setCTM(zpdElement.data.stateTarget,
            zpdElement.data.root.createSVGMatrix()
              .translate(dragPoint.x - zpdElement.data.stateOrigin.x, dragPoint.y - zpdElement.data.stateOrigin.y)
              .multiply(g.getCTM().inverse())
              .multiply(zpdElement.data.stateTarget.getCTM()),
            zpdElement.options.zoomThreshold)

          zpdElement.data.stateOrigin = dragPoint
        }
      }

      const handleMouseWheel = function handleMouseWheel (event) {
        if (!zpdElement.options.zoom) {
          return
        }

        if (!snapsvgzpd.enable) return

        let delta = 0

        if (event.wheelDelta) {
          delta = event.wheelDelta / 360 // Chrome/Safari
        } else {
          delta = event.detail / -9 // Mozilla
        }

        const z = Math.pow(1 + zpdElement.options.zoomScale, delta)

        const g = zpdElement.element.node

        let p = _getEventPoint(event, zpdElement.data.svg)

        p = p.matrixTransform(g.getCTM().inverse())

        // Compute new scale matrix in current mouse position
        const k = zpdElement.data.root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y)

        _setCTM(g, g.getCTM().multiply(k), zpdElement.options.zoomThreshold)

        if (typeof (stateTf) === 'undefined') {
          zpdElement.data.stateTf = g.getCTM().inverse()
        }

        zpdElement.data.stateTf = zpdElement.data.stateTf.multiply(k.inverse())
      }

      return {
        mouseUp: handleMouseUp,
        mouseDown: handleMouseDown,
        mouseMove: handleMouseMove,
        mouseWheel: handleMouseWheel
      }
    }

    /**
         * Register handlers
         * desktop and mobile (?)
         */
    const _setupHandlers = function setupHandlers (svgElement, handlerFunctions) {
      // mobile
      // (?)

      // desktop
      if ('onmouseup' in document.documentElement) {
        // IE < 9 would need to use the event onmouseup, but they do not support svg anyway..
        svgElement.addEventListener('mouseup', handlerFunctions.mouseUp, false)
        svgElement.addEventListener('mousedown', handlerFunctions.mouseDown, false)
        svgElement.addEventListener('mousemove', handlerFunctions.mouseMove, false)

        if (navigator.userAgent.toLowerCase().indexOf('webkit') >= 0 ||
                    navigator.userAgent.toLowerCase().indexOf('trident') >= 0) {
          svgElement.addEventListener('mousewheel', handlerFunctions.mouseWheel, { passive: true }) // Chrome/Safari
        } else {
          svgElement.addEventListener('DOMMouseScroll', handlerFunctions.mouseWheel, false) // Others
        }
      }
    }

    /**
         * remove event handlers
         */
    const _tearDownHandlers = function tearDownHandlers (svgElement, handlerFunctions) {
      svgElement.removeEventListener('mouseup', handlerFunctions.mouseUp, false)
      svgElement.removeEventListener('mousedown', handlerFunctions.mouseDown, false)
      svgElement.removeEventListener('mousemove', handlerFunctions.mouseMove, false)

      if (navigator.userAgent.toLowerCase().indexOf('webkit') >= 0 ||
                navigator.userAgent.toLowerCase().indexOf('trident') >= 0) {
        svgElement.removeEventListener('mousewheel', handlerFunctions.mouseWheel, false)
      } else {
        svgElement.removeEventListener('DOMMouseScroll', handlerFunctions.mouseWheel, false)
      }
    }

    /* our global zpd function */
    const zpd = function (options, callbackFunc) {
      // get a reference to the current element
      const self = this

      // define some custom options
      const zpdOptions = {
        pan: true, // enable or disable panning (default enabled)
        zoom: true, // enable or disable zooming (default enabled)
        drag: false, // enable or disable dragging (default disabled)
        zoomScale: 0.2, // define zoom sensitivity
        zoomThreshold: null // define zoom threshold
      }

      // the situation event of zpd, may be init, reinit, destroy, save, origin, toggle
      let situation
      const situationState = {
        init: 'init',
        reinit: 'reinit',
        destroy: 'destroy',
        save: 'save',
        origin: 'origin',
        callback: 'callback',
        toggle: 'toggle'
      }

      let zpdElement = null

      // it is also possible to only specify a callback function without any options
      if (typeof options === 'function') {
        callbackFunc = options
        situation = situationState.callback
      }

      // check if element was already initialized
      if (snapsvgzpd.dataStore.hasOwnProperty(self.id)) {
        // return existing element
        zpdElement = snapsvgzpd.dataStore[self.id]

        // adapt the stored options, with the options passed in
        if (typeof options === 'object') {
          for (const prop in options) {
            zpdElement.options[prop] = options[prop]
          }
          situation = situationState.reinit
        } else if (typeof options === 'string') {
          situation = options
        }
      } else {
        // adapt the default options
        if (typeof options === 'object') {
          for (const prop2 in options) {
            zpdOptions[prop2] = options[prop2]
          }
          situation = situationState.init
        } else if (typeof options === 'string') {
          situation = options
        }

        // initialize a new element and save it to our global storage
        zpdElement = _initZpdElement(self, zpdOptions)

        // setup the handlers for our svg-canvas
        _setupHandlers(self.node, zpdElement.handlerFunctions)

        snapsvgzpd.dataStore[self.id] = zpdElement
      }

      switch (situation) {
        case situationState.init:
        case situationState.reinit:
        case situationState.callback:

          // callback
          if (callbackFunc) {
            callbackFunc(null, zpdElement)
          }

          return

        case situationState.destroy:

          // remove event handlers
          _tearDownHandlers(self.node, zpdElement.handlerFunctions)

          // remove our custom <g> element
          _removeNodeKeepChildren(self.node.firstChild)

          // remove the object from our internal storage
          delete snapsvgzpd.dataStore[self.id]

          // callback
          if (callbackFunc) {
            callbackFunc(null, zpdElement)
          }

          return // exit all

        case situationState.save:

          var g = document.getElementById(snapsvgzpd.uniqueIdPrefix + self.id)

          var returnValue = g.getCTM()

          // callback
          if (callbackFunc) {
            callbackFunc(null, returnValue)
          }

          return returnValue

        case situationState.origin:

          // back to origin location
          self.zoomTo(1, 1000)

          // callback
          if (callbackFunc) {
            callbackFunc(null, zpdElement)
          }

          return

        case situationState.toggle:

          // toggle enabled
          snapsvgzpd.enable = !snapsvgzpd.enable

          // callback
          if (callbackFunc) {
            callbackFunc(null, snapsvgzpd.enable)
          }
      }
    }

    /**
         * zoom element to a certain zoom factor
         */
    const zoomTo = function (zoom, interval, ease, callbackFunction) {
      if (zoom < 0 || typeof zoom !== 'number') {
        console.error('zoomTo(arg) should be a number and greater than 0')
        return
      }

      if (typeof interval !== 'number') {
        interval = 3000
      }

      const self = this

      // check if we have this element in our zpd data storage
      if (snapsvgzpd.dataStore.hasOwnProperty(self.id)) {
        // get a reference to the element
        const zpdElement = snapsvgzpd.dataStore[self.id].element

        const currentTransformMatrix = zpdElement.node.getTransformToElement(rootSvgObject)
        const currentZoom = currentTransformMatrix.a
        const originX = currentTransformMatrix.e
        const originY = currentTransformMatrix.f

        const boundingBox = zpdElement.getBBox()
        const deltaX = parseFloat(boundingBox.width) / 2.0
        const deltaY = parseFloat(boundingBox.height) / 2.0

        Snap.animate(currentZoom, zoom, function (value) {
          // calculate difference of zooming value to initial zoom
          const deltaZoom = value / currentZoom

          if (value !== currentZoom) {
            // calculate new translation
            currentTransformMatrix.e = originX - ((deltaX * deltaZoom - deltaX))
            currentTransformMatrix.f = originY - ((deltaY * deltaZoom - deltaY))

            // add new scaling
            currentTransformMatrix.a = value
            currentTransformMatrix.d = value

            // apply transformation to our element
            zpdElement.node.setAttribute('transform', _getSvgMatrixAsString(currentTransformMatrix))
          }
        }, interval, ease, callbackFunction)
      }
    }

    /**
         * move the element to a certain position
         */
    const panTo = function (x, y, interval, ease, cb) {
      // get a reference to the current element
      const self = this

      // check if we have this element in our zpd data storage
      if (snapsvgzpd.dataStore.hasOwnProperty(self.id)) {
        const zpdElement = snapsvgzpd.dataStore[self.id].element

        const gMatrix = zpdElement.node.getCTM()
        const matrixX = _increaseDecreaseOrNumber(gMatrix.e, x)
        const matrixY = _increaseDecreaseOrNumber(gMatrix.f, y)
        const matrixString = 'matrix(' + gMatrix.a + ',' + gMatrix.b + ',' + gMatrix.c + ',' + gMatrix.d + ',' + matrixX + ',' + matrixY + ')'

        // dataStore[me.id].transform(matrixString); // load <g> transform matrix
        zpdElement.animate({ transform: matrixString }, interval || 10, ease || null, function () {
          if (cb) {
            cb(null, zpdElement)
          }
        })
      }
    }

    /**
         * rotate the element to a certain rotation
         */
    const rotate = function (a, x, y, interval, ease, cb) {
      // get a reference to the current element
      const self = this

      // check if we have this element in our zpd data storage
      if (snapsvgzpd.dataStore.hasOwnProperty(self.id)) {
        const zpdElement = snapsvgzpd.dataStore[self.id].element

        const gMatrix = zpdElement.node.getCTM()
        const matrixString = 'matrix(' + gMatrix.a + ',' + gMatrix.b + ',' + gMatrix.c + ',' + gMatrix.d + ',' + gMatrix.e + ',' + gMatrix.f + ')'

        if (!x || typeof x !== 'number') {
          x = self.node.offsetWidth / 2
        }
        if (!y || typeof y !== 'number') {
          y = self.node.offsetHeight / 2
        }

        // dataStore[me.id].transform(matrixString); // load <g> transform matrix
        zpdElement.animate({ transform: new Snap.Matrix(gMatrix).rotate(a, x, y) }, interval || 10, ease || null, function () {
          if (cb) {
            cb(null, zpdElement)
          }
        })
      }
    }

    Paper.prototype.zpd = zpd
    Paper.prototype.zoomTo = zoomTo
    Paper.prototype.panTo = panTo
    Paper.prototype.rotate = rotate

    /** More Features to add (click event) help me if you can **/
    // Element.prototype.panToCenter = panToCenter; // arg (ease, interval, cb)

    /** UI for zpdr **/
  })
})(Snap)
