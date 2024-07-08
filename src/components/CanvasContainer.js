import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import GestureOutlinedIcon from '@mui/icons-material/GestureOutlined';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import SaveAltOutlinedIcon from '@mui/icons-material/SaveAltOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import PhotoAlbumOutlinedIcon from '@mui/icons-material/PhotoAlbumOutlined';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import BrushOutlinedIcon from '@mui/icons-material/BrushOutlined';
import { FaCircle } from "react-icons/fa6";
import AutoFixNormalOutlinedIcon from '@mui/icons-material/AutoFixNormalOutlined';
import RectangleOutlinedIcon from '@mui/icons-material/RectangleOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import ChangeHistoryOutlinedIcon from '@mui/icons-material/ChangeHistoryOutlined';
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined';
import { TbOvalVertical } from "react-icons/tb";
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import { Tooltip } from 'react-tooltip'
import Slider from '@mui/material/Slider';
import '../styles/CanvasContainer.css';

const CanvasContainer = () => {

    // Task 1 (state variables)
    const canvasRef = useRef(null); // canvas reference to refer to canvas instance inside the DOM
    const [canvasData, setCanvasData] = useState(null); // state to hold the canvas data
    const [drawingEnabled, setDrawingEnabled] = useState(true); // state to keep track of drawing enabled or disabled
    const canvasWidth = 1300; // canvas width
    const canvasHeight = 910; // canvas height
    // Task 2 (state variables)
    const [isPanning, setIsPanning] = useState(false); // state to keep track of pan mode enabled or disabled
    const panRef = useRef(false); // reference to refer to canvas pan inside the DOM
    // Task 6 (state variables)
    const [canvasHistory, setCanvasHistory] = useState([]); // state to store history of the canvas element
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1); // state to keep track of the index within the history state
    // Task 9 (state variables)
    const [selectedColor, setSelectedColor] = useState("black"); // state to keep track of currently selected color
    const colors = [
        "red", "blue", "green", "yellow", "orange", "purple", "pink", "brown",
        "white", "gray", "black", "olive", "plum", "magenta", "cyan", "salmon", "khaki", "maroon", 
        "silver", "gold", "teal", "coral", "tomato", "midnightblue", "turquoise", "orchid", "azure", "aqua"
    ]; // array of 28 different colors
    // Task 10 (state variables)
    const [selectedBrush, setSelectedBrush] = useState("Pencil brush"); // state to keep track of currently selected brush
    // Task 12 (state variables)
    const [offsetX, setOffsetX] = useState(0); // state to keep track of current x-offset from center
    const [offsetY, setOffsetY] = useState(0); // state to keep track of current y-offset from center
    // Task 14 (state variables)
    const colorRef = useRef('black'); // reference to refer to the currently selected color

    useEffect(() => {
        // Task 1 (initialise Fabric.js canvas)
        const newCanvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: drawingEnabled,
        });
        // Task 1 (set control styles)
        fabric.Object.prototype.set({
            borderColor: 'darkblue',
            cornerColor: 'darkblue',
            cornerStrokeColor: 'darkblue',
            cornerSize: 8,
            transparentCorners: false,
        });
        // Task 1 (set initial values of canvas brush color, width, and size)
        newCanvas.freeDrawingBrush.width = 5;
        newCanvas.freeDrawingBrush.color = 'black';
        newCanvas.setWidth(canvasWidth);
        newCanvas.setHeight(canvasHeight);
        // Task 6 (add initial state of canvas to history and increment current history index)
        setCanvasHistory((prevHistory) => [...prevHistory, newCanvas.toJSON()]);
        setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
        // Task 3 (zoom functionality)
        newCanvas.on('mouse:wheel', function (opt) {
            var mouseDistanceTravelled = opt.e.deltaY;
            var currentZoomLevel = newCanvas.getZoom();
            currentZoomLevel = currentZoomLevel * 0.999 ** mouseDistanceTravelled;
            if (currentZoomLevel > 20)
                currentZoomLevel = 20;
            if (currentZoomLevel < 0.01)
                currentZoomLevel = 0.01;
            newCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, currentZoomLevel);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });
        // Task 4 (event listener to listen for the mouse wheel-down action)
        newCanvas.on('mouse:down', function(opt) {
            if (newCanvas.isDrawingMode === true)
                return;
            else 
            {
                if (panRef.current === true) {
                    var events = opt.e;
                    newCanvas.isDragging = true;
                    newCanvas.lastPosX = events.clientX;
                    newCanvas.lastPosY = events.clientY;
                }
            }
        });
        // Task 4 (event listener to listen for the mouse move action)
        newCanvas.on('mouse:move', function(opt) {
            if (newCanvas.isDragging) {
                var events = opt.e;
                var eventData = newCanvas.viewportTransform;
                eventData[4] += events.clientX - newCanvas.lastPosX;
                eventData[5] += events.clientY - newCanvas.lastPosY;
                newCanvas.requestRenderAll();
                newCanvas.lastPosX = events.clientX;
                newCanvas.lastPosY = events.clientY;
            }
        });
        // Task 4 (event listener to listen for the mouse wheel-up action)
        newCanvas.on('mouse:up', function(opt) {
            if (newCanvas.isDragging) {
                newCanvas.setViewportTransform(newCanvas.viewportTransform);
                newCanvas.isDragging = false;
            }
            // Task 6 (add updated state of canvas to history and increment current history index)
            setCanvasHistory((prevHistory) => [...prevHistory, newCanvas.toJSON()]);
            setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
        });
        // Task 14 (event listener to handle text annotations)
        newCanvas.on('mouse:dblclick', function(opt) {
            const pointer = newCanvas.getPointer(opt.e);
            const x = pointer.x;
            const y = pointer.y;
            const text = new fabric.Textbox('Click to add text when drawing mode is disabled', {
                left: x,
                top: y,
                fontSize: 27,
                fill: colorRef.current,
                width: 320
            });
            newCanvas.add(text);
            setCanvasHistory((prevHistory) => [...prevHistory, newCanvas.toJSON()]);
            setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
        });
        // Task 1 (save canvas instance)
        setCanvasData(newCanvas);
        // Task 1 (dispose canvas element when component unmounts)
        return () => {
            newCanvas.dispose();
        };
    }, []);

    const changeDrawingMode = () => {
        // Task 2 (handling drawing mode)
        if (canvasData.isDrawingMode === true) {
            canvasData.isDrawingMode = false;
            setDrawingEnabled(false);
            canvasData.defaultCursor = 'default';
        }
        else {
            canvasData.isDrawingMode = true;
            setDrawingEnabled(true);
            canvasData.defaultCursor = 'crosshair';
        }
    }

    const changePanMode = () => {
        // Task 5 (handle pan functionality)
        if (drawingEnabled === true && panRef.current === false) {
            canvasData.isDrawingMode = false;
            panRef.current = true;
            canvasData.defaultCursor = 'grab';
            setDrawingEnabled(false);
            setIsPanning(true);
        }
        else if (!drawingEnabled && panRef.current === false) {
            panRef.current = true;
            canvasData.defaultCursor = 'grab';
            setIsPanning(true);
        }
        else if (!drawingEnabled && panRef.current === true) {
            panRef.current = false;
            canvasData.defaultCursor = 'default';
            setIsPanning(false);
        }
    }

    const undo = () => {
        // Task 6 (handle undo functionality)
        if (currentHistoryIndex >= 0) {
            const previousState = currentHistoryIndex === 0 ? canvasHistory[0] : canvasHistory[currentHistoryIndex - 1];
            canvasData.loadFromJSON(previousState, () => {
                canvasData.renderAll();
            });
            setCurrentHistoryIndex((prevIndex) => prevIndex - 1);
        }
    };
    
    const redo = () => {
        // Task 6 (handle redo functionality)
        if (currentHistoryIndex < canvasHistory.length - 1) {
            const nextState = canvasHistory[currentHistoryIndex + 1];
            canvasData.loadFromJSON(nextState, () => {
                canvasData.renderAll();
            });
            setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
        }
    };

    const clearCanvas = () => {
        // Task 6 (handle clear functionality)
        setCanvasHistory((prevHistory) => [prevHistory[0]]);
        setCurrentHistoryIndex(0);
        canvasData.clear();
    }

    const save = () => {
        // Task 7 (handle save functionality)
        const drawingData = canvasData.toJSON();
        const jsonBlob = new Blob([JSON.stringify(drawingData)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(jsonBlob);
        a.download = 'my-drawing.json';
        a.click();
    }

    const load = () => {
        // Task 7 (handle load functionality)
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.type !== 'application/json') {
                    alert('Please select a valid drawing file!');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    const jsonString = e.target.result;
                    const drawingData = JSON.parse(jsonString);
                    canvasData.loadFromJSON(drawingData, () => {
                        canvasData.renderAll();
                    });
                };
                reader.readAsText(file);
            }
        });
        input.click();
    }

    const saveAsPNG = () => {
        // Task 8 (handle download drawing as png functionality)
        if (canvasData) {
            const pngDataUrl = canvasData.toDataURL({
                format: 'png',
                quality: 1,
            });
            const a = document.createElement('a');
            a.href = pngDataUrl;
            a.download = 'my-drawing.png';
            a.click();
        }
    };

    const changeColor = (color) => {
        // Task 10 (don't allow color change if eraser is currently selected)
        if (selectedBrush === "Eraser")
            return;
        // Task 9 (handle color change functionality)
        canvasData.freeDrawingBrush.color = color;
        setSelectedColor(color);
        // Task 14 (update reference to currently selected color)
        colorRef.current = color;
    }

    const changeBrush = (brush) => {
        // Task 10 (handle brush change functionality)
        if (brush === "Eraser" && selectedBrush === "Eraser") {
            return;
        }
        let flag = false;
        if (selectedBrush === 'Eraser') {
            setSelectedColor('black');
            // Task 14 (update reference to currently selected color)
            colorRef.current = 'black';
            flag = true;
        }
        const currentBrush = canvasData.freeDrawingBrush;
        if (brush === "Pencil brush") {
            canvasData.freeDrawingBrush = new fabric.PencilBrush(canvasData);
        }
        else if (brush === "Spray brush") {
            canvasData.freeDrawingBrush = new fabric.SprayBrush(canvasData);
        }
        else if (brush === "Circle brush") {
            canvasData.freeDrawingBrush = new fabric.CircleBrush(canvasData);
        }
        else if (brush === "Eraser") {
            canvasData.freeDrawingBrush = new fabric.PencilBrush(canvasData);
            canvasData.freeDrawingBrush.color = 'white';
            setSelectedColor('white');
            // Task 14 (update reference to currently selected color)
            colorRef.current = 'black';
        }
        if (brush !== "Eraser" && flag !== true)
            canvasData.freeDrawingBrush.color = currentBrush.color;
        canvasData.freeDrawingBrush.width = currentBrush.width;
        setSelectedBrush(brush);
    }

    const addShape = (shape) => {
        // Task 12 (handle pre-defined shapes functionality)
        if (selectedBrush === "Eraser")
            return;
        const shapeSpacing = 12;
        const canvasCenterX = canvasData.width / 2;
        const canvasCenterY = canvasData.height / 2;
        const newOffsetX = offsetX + (2 * shapeSpacing);
        const newOffsetY = offsetY + (2 * -shapeSpacing);
        if (shape === "Rectangle") {
            const rectWidth = 100;
            const rectHeight = 45;
            const rectLeft = canvasCenterX - rectWidth / 2 + newOffsetX;
            const rectTop = canvasCenterY - rectHeight / 2 + newOffsetY;
            const rect = new fabric.Rect({
                left: rectLeft,
                top: rectTop,
                width: rectWidth,
                height: rectHeight,
                fill: selectedColor
            });
            canvasData.add(rect);
        }
        else if (shape === "Circle") {
            const circleRadius = 35;
            const circleLeft = canvasCenterX - circleRadius + newOffsetX;
            const circleTop = canvasCenterY - circleRadius + newOffsetY;
            const circle = new fabric.Circle({
                left: circleLeft,
                top: circleTop,
                radius: circleRadius,
                fill: selectedColor
            });
            canvasData.add(circle);
        }
        else if (shape === "Triangle") {
            const triangleSideLength = 100;
            const triangleLeft = canvasCenterX - triangleSideLength / 2 + newOffsetX;
            const triangleTop = canvasCenterY + (Math.sqrt(3) / 2) * triangleSideLength / 2 + newOffsetY;
            const triangle = new fabric.Polygon(
                [
                    { x: 0, y: 0 },
                    { x: triangleSideLength, y: 0 },
                    { x: triangleSideLength / 2, y: -(Math.sqrt(3) / 2) * triangleSideLength }
                ], 
                {
                    left: triangleLeft,
                    top: triangleTop,
                    fill: selectedColor
                }
            );
            canvasData.add(triangle);
        }
        else if (shape === "Square") {
            const squareSideLength = 70;
            const squareLeft = canvasCenterX - squareSideLength / 2 + newOffsetX;
            const squareTop = canvasCenterY - squareSideLength / 2 + newOffsetY;
            const square = new fabric.Rect({
                left: squareLeft,
                top: squareTop,
                width: squareSideLength,
                height: squareSideLength,
                fill: selectedColor
            });
            canvasData.add(square);
        }
        else if (shape === "Ellipse") {
            const horizontalRadius = 60;
            const verticalRadius = 40;
            const ellipseLeft = canvasCenterX - horizontalRadius + newOffsetX;
            const ellipseTop = canvasCenterY - verticalRadius + newOffsetY;
            const ellipse = new fabric.Ellipse({
                left: ellipseLeft,
                top: ellipseTop,
                rx: horizontalRadius,
                ry: verticalRadius,
                fill: selectedColor
            });
            canvasData.add(ellipse);
        }
        setOffsetX(newOffsetX);
        setOffsetY(newOffsetY);
    }

    const addCustomImage = () => {
        // Task 13 (handle custom image functionality)
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function (e) {
            const fileInput = e.target;
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const imgSrc = e.target.result;
                        fabric.Image.fromURL(imgSrc, (img) => {
                            img.set({
                                left: (canvasData.width / 2) - img.width / 2,
                                top: (canvasData.height / 2) - img.height / 2,
                            });
                            canvasData.add(img);
                        });
                    };
                    reader.readAsDataURL(file);
                }
                else {
                    alert('Invalid file format! Please select a valid image file.');
                }
            }
        };
        input.click();
    }

    return (
        <div className="outer-container">
            <div className="canvas-functions">
                {/* Task 2+5+6+7+8+10+12+13 (tooltip) */}
                <Tooltip id="my-tooltip" />
            `    <div className="container">
                    <div className="row">
                        {/* Task 2 (ui within the render method) */}
                        <div className="col column-height">
                            <GestureOutlinedIcon
                                onClick={() => changeDrawingMode()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Drawing mode"
                                style={{
                                    fontSize: '40px',
                                    color: drawingEnabled ? 'darkblue' : 'gray'
                                }}
                            />
                        </div>
                        {/* Task 5 (ui within the render method) */}
                        <div className="col column-height">
                            <PanToolOutlinedIcon
                                onClick={() => changePanMode()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Panning mode"
                                style={{
                                    fontSize: '40px',
                                    color: isPanning ? 'darkblue' : 'gray'
                                }}
                            />
                        </div>
                        {/* Task 6 (ui within the render method for undo functionality) */}
                        <div className="col column-height">
                            <UndoOutlinedIcon
                                onClick={() => undo()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Undo"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 6 (ui within the render method for redo functionality) */}
                        <div className="col column-height">
                            <RedoOutlinedIcon
                                onClick={() => redo()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Redo"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 6 (ui within the render method for clear functionality) */}
                        <div className="col column-height">
                            <ClearOutlinedIcon
                                onClick={() => clearCanvas()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Clear canvas"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 7 (ui within the render method for save functionality) */}
                        <div className="col column-height">
                            <SaveAltOutlinedIcon
                                onClick={() => save()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Save drawing"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 7 (ui within the render method for load functionality) */}
                        <div className="col column-height">
                            <FileUploadOutlinedIcon
                                onClick={() => load()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Load drawing"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 8 (ui within the render method) */}
                        <div className="col column-height">
                            <PhotoAlbumOutlinedIcon
                                onClick={() => saveAsPNG()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Save as png file"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 10 (ui within the render method for pencil brush) */}
                        <div className="col column-height">
                            <CreateOutlinedIcon
                                onClick={() => changeBrush("Pencil brush")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Pencil"
                                style={{
                                    fontSize: '40px',
                                    color: selectedBrush === "Pencil brush" ? 'darkblue' : 'gray'
                                }}
                            />
                        </div>
                        {/* Task 10 (ui within the render method for spray brush) */}
                        <div className="col column-height">
                            <BrushOutlinedIcon
                                onClick={() => changeBrush("Spray brush")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Spray brush"
                                style={{
                                    fontSize: '40px',
                                    color: selectedBrush === "Spray brush" ? 'darkblue' : 'gray'
                                }}
                            />
                        </div>
                        {/* Task 10 (ui within the render method for circle brush) */}
                        <div className="col column-height">
                            <FaCircle
                                onClick={() => changeBrush("Circle brush")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Circle brush"
                                style={{
                                    fontSize: '40px',
                                    color: selectedBrush === "Circle brush" ? 'darkblue' : 'gray'
                                }}
                            />
                        </div>
                        {/* Task 10 (ui within the render method for eraser) */}
                        <div className="col column-height">
                            <AutoFixNormalOutlinedIcon
                                onClick={() => changeBrush("Eraser")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Eraser"
                                style={{
                                    fontSize: '40px',
                                    color: selectedBrush === "Eraser" ? 'darkblue' : 'gray'
                                }}
                            />
                        </div>
                        {/* Task 12 (ui within the render method for rectangle shape) */}
                        <div className="col column-height">
                            <RectangleOutlinedIcon
                                onClick={() => addShape("Rectangle")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Rectangle"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 12 (ui within the render method for circle shape) */}
                        <div className="col column-height">
                            <CircleOutlinedIcon
                                onClick={() => addShape("Circle")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Circle"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 12 (ui within the render method for triangle shape) */}
                        <div className="col column-height">
                            <ChangeHistoryOutlinedIcon
                                onClick={() => addShape("Triangle")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Triangle"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 12 (ui within the render method for square shape) */}
                        <div className="col column-height">
                            <CropSquareOutlinedIcon
                                onClick={() => addShape("Square")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Square"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 12 (ui within the render method for ellipse shape) */}
                        <div className="col column-height">
                            <TbOvalVertical
                                onClick={() => addShape("Ellipse")}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Ellipse"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                        {/* Task 12 (ui within the render method) */}
                        <div className="col column-height">
                            <DriveFolderUploadOutlinedIcon
                                onClick={() => addCustomImage()}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content="Upload custom image"
                                style={{
                                    fontSize: '40px',
                                    color: 'darkblue'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Task 1 (display canvas element) */}
            <div style={{ border: '2px solid black', display: 'inline-block' }} className="canvas-container">
                <canvas ref={canvasRef} />
            </div>
            <div className="canvas-colors">
                <div class="container">
                    {/* Task 9 (ui within the render method) */}
                    <div class="row">
                        {colors.map((color, index) => (
                            <div
                                key={index}
                                className={`col ${color} color-column-height`}
                                onClick={() => changeColor(color)}
                            >
                                <span style={{ visibility: 'hidden' }}>column</span>
                                <div class="w-100"></div>
                            </div>
                        ))}
                    </div>
                    <div class="row">
                        <div style={{ backgroundColor: selectedColor, borderTop: '1px solid black', borderBottom: '1px solid black' }} className={`col selected-color-height`}></div>
                    </div>
                    {/* Task 11 (ui within the render method) */}
                    <div className={`col thickness-height`}>
                        <p style={{ fontSize: '35px', paddingTop: '40px' }}  className="text-center"> Thickness </p>
                        <Slider
                            aria-label="Thickness"
                            defaultValue={2}
                            valueLabelDisplay="auto"
                            step={0.5}
                            marks
                            min={1}
                            max={30}
                            onChange={(_, newValue) => canvasData.freeDrawingBrush.width = newValue}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CanvasContainer;