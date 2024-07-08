import React, { useRef, useState, useEffect } from 'react';

const applyEffect = (image, effect, centerX, centerY, radius, strength) => {
    if (!window.fx) {
        console.error('glfx.js not loaded');
        return;
    }

    const canvas = window.fx.canvas();
    const texture = canvas.texture(image);

    canvas.draw(texture);

    console.log("Config",effect, centerX, centerY, radius, strength);

    if (effect === 'bulge') {
        canvas.bulgePinch(centerX, centerY, radius, strength);
    } else if (effect === 'pinch') {
        canvas.bulgePinch(centerX, centerY, radius, -strength);
    }

    canvas.update();
    return canvas;
};

const ImageEditor = () => {
    const imageRef = useRef(null);
    const originalCanvasRef = useRef(null);
    const modifiedCanvasRef = useRef(null);
    const [effect, setEffect] = useState('bulge');
    const [strength, setStrength] = useState(0.5);
    const [radius, setRadius] = useState(0.5);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedArea, setSelectedArea] = useState(null); // { x, y, width, height }

    useEffect(() => {
        const drawOriginalImage = () => {
            if (imageRef.current && originalCanvasRef.current) {
                const image = imageRef.current;
                const canvas = originalCanvasRef.current;
                const context = canvas.getContext('2d');

                const { x, y, width, height } = selectedArea || { x: 0, y: 0, width: image.width, height: image.height };
                canvas.width = width;
                canvas.height = height;

                if (context) {
                    context.drawImage(image, x, y, width, height, 0, 0, width, height);
                }
            }
        };

        const applyImageEffect = () => {
            if (imageRef.current && modifiedCanvasRef.current && selectedArea) {
                const image = imageRef.current;
                const canvas = modifiedCanvasRef.current;
                const centerX = selectedArea.x + selectedArea.width / 2;
                const centerY = selectedArea.y + selectedArea.height / 2;

                const texture = applyEffect(image, effect, centerX, centerY, radius, strength);
                if (texture) {
                    canvas.width = texture.width;
                    canvas.height = texture.height;
                    const context = canvas.getContext('2d');
                    if (context) {
                        context.drawImage(texture, 0, 0);
                    }
                }
            }
        };

        if (imageLoaded) {
            drawOriginalImage();
            applyImageEffect();
        }
    }, [effect, strength, radius, imageLoaded, selectedArea]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (imageRef.current) {
                    imageRef.current.src = reader.result;
                    setImageLoaded(false); // Reset image loaded state
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleAreaSelect = (e) => {
        if (imageRef.current) {
            const image = imageRef.current;
            const boundingRect = image.getBoundingClientRect();
            const x = (e.clientX - boundingRect.left) * (image.width / boundingRect.width);
            const y = (e.clientY - boundingRect.top) * (image.height / boundingRect.height);

            // Set selected area (example: 100x100 area centered at clicked point)
            const width = 100;
            const height = 100;
            setSelectedArea({
                x: Math.max(0, x - width / 2),
                y: Math.max(0, y - height / 2),
                width,
                height,
            });
        }
    };

    const handleApplyEffect = () => {
        if (imageRef.current && selectedArea) {
            console.log("Selected Area",selectedArea);
            const image = imageRef.current;
            const canvas = modifiedCanvasRef.current;
            const centerX = selectedArea.x + selectedArea.width / 2;
            const centerY = selectedArea.y + selectedArea.height / 2;

            const texture = applyEffect(image, effect, centerX, centerY, radius, strength);
            if (texture) {
                canvas.width = texture.width;
                canvas.height = texture.height;
                const context = canvas.getContext('2d');
                console.log("Context",context);
                if (context) {
                    context.drawImage(texture, 0, 0);
                }
            }
        }
    };

    return (
        <div>
            <input type="file" onChange={handleImageChange} />
            <div>
                <label>
                    Effect:
                    <select value={effect} onChange={(e) => setEffect(e.target.value)}>
                        <option value="bulge">Bulge</option>
                        <option value="pinch">Pinch</option>
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Strength:
                    <input
                        type="range"
                        min={-1}
                        max={1}
                        step={0.01}
                        value={strength}
                        onChange={(e) => setStrength(parseFloat(e.target.value))}
                    />
                </label>
            </div>
            <div>
                <label>
                    Radius:
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={radius}
                        onChange={(e) => setRadius(parseFloat(e.target.value))}
                    />
                </label>
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                    ref={imageRef}
                    alt="To be edited"
                    style={{ maxWidth: '100%', maxHeight: '500px', cursor: 'crosshair' }}
                    onLoad={handleImageLoad}
                    onClick={handleAreaSelect}
                />
                {selectedArea && (
                    <div
                        style={{
                            position: 'absolute',
                            left: selectedArea.x,
                            top: selectedArea.y,
                            width: selectedArea.width,
                            height: selectedArea.height,
                            border: '2px dashed #f00',
                        }}
                    />
                )}
            </div>
            <div>
                <div style={{ marginTop: '10px' }}>
                    <button onClick={handleApplyEffect} disabled={!selectedArea || !imageLoaded}>
                        Apply Effect
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                    <canvas ref={originalCanvasRef} />
                    <canvas ref={modifiedCanvasRef} />
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
