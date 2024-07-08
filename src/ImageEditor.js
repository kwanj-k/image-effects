import React, { useRef, useState, useEffect } from 'react';

const applyEffect = (image, effect, centerX, centerY, radius, strength) => {
    if (!window.fx) {
        console.error('glfx.js not loaded');
        return null;
    }

    const canvas = window.fx.canvas();
    const texture = canvas.texture(image);

    canvas.draw(texture);

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
    const modifiedCanvasRef = useRef(null);
    const [effect, setEffect] = useState('bulge');
    const [strength, setStrength] = useState(0.5);
    const [radius, setRadius] = useState(0.5);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null); // { x, y }

    useEffect(() => {
        const drawOriginalImage = () => {
            if (imageRef.current) {
                const image = imageRef.current;
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = image.width;
                canvas.height = image.height;

                if (context) {
                    context.drawImage(image, 0, 0, image.width, image.height);
                }
            }
        };

        if (imageLoaded) {
            drawOriginalImage();
        }
    }, [imageLoaded]);

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

    const handleImageClick = (e) => {
        if (imageRef.current) {
            const image = imageRef.current;
            const boundingRect = image.getBoundingClientRect();
            const x = (e.clientX - boundingRect.left) * (image.width / boundingRect.width);
            const y = (e.clientY - boundingRect.top) * (image.height / boundingRect.height);

            setSelectedPoint({ x, y });
        }
    };

    const handleApplyEffect = () => {
        if (imageRef.current && selectedPoint) {
            const image = imageRef.current;
            const canvas = modifiedCanvasRef.current;
            const { x: centerX, y: centerY } = selectedPoint;

            const texture = applyEffect(image, effect, centerX, centerY, radius * Math.min(image.width, image.height), strength);
            if (texture) {
                canvas.width = texture.width;
                canvas.height = texture.height;
                const context = canvas.getContext('2d');
                if (context) {
                    context.drawImage(texture, 0, 0);

                    // Draw the selected point as a red circle
                    context.strokeStyle = 'red';
                    context.lineWidth = 2;
                    context.beginPath();
                    context.arc(centerX, centerY, 5, 0, 2 * Math.PI);
                    context.stroke();
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
                    onClick={handleImageClick}
                />
                {selectedPoint && (
                    <div
                        style={{
                            position: 'absolute',
                            left: selectedPoint.x - 5,
                            top: selectedPoint.y - 5,
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: 'red',
                            pointerEvents: 'none',
                        }}
                    />
                )}
            </div>
            <div>
                <div style={{ marginTop: '10px' }}>
                    <button onClick={handleApplyEffect} disabled={!selectedPoint || !imageLoaded}>
                        Apply Effect
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                    <canvas ref={modifiedCanvasRef} />
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
