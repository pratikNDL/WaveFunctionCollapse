
const socket = io();

socket.on('gridData', (data) => {


    const n = Math.sqrt(data.length); // grid size
    const grid = document.getElementById('grid');
    grid.innerHTML = null
    grid.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${n}, 1fr)`;

    for (let i = 0; i < n * n; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    
    if(Math.random() > 0.5) {
        const img = document.createElement('img');
        img.src = Math.random() > 0.5 ? './images/blank.png' : './images/right.png';
        cell.appendChild(img);
    }

    grid.appendChild(cell);
    }
});

