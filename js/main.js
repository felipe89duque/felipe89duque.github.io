// Simple neuron visualization
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('neuronCanvas');
    
    if (canvas) {
        const ctx = canvas.getContext('2d');
        drawNeuron(ctx, canvas.width, canvas.height);
    }
});

function drawNeuron(ctx, width, height) {
    // Clear canvas
    ctx.fillStyle = '#f0f4ff';
    ctx.fillRect(0, 0, width, height);

    // Draw soma (cell body)
    ctx.fillStyle = '#0066cc';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 40, 0, Math.PI * 2);
    ctx.fill();

    // Draw nucleus
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw dendrite
    ctx.strokeStyle = '#00a8e8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 40, height / 2);
    ctx.quadraticCurveTo(width / 2 - 100, height / 2 - 50, width / 2 - 120, height / 2 - 80);
    ctx.stroke();

    // Draw axon
    ctx.strokeStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(width / 2 + 40, height / 2);
    ctx.quadraticCurveTo(width / 2 + 100, height / 2 + 50, width / 2 + 120, height / 2 + 80);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText('Soma', width / 2 - 20, height / 2 + 70);
    ctx.fillText('Dendrite', width / 2 - 120, height / 2 - 100);
    ctx.fillText('Axon', width / 2 + 100, height / 2 + 100);
}
