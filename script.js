class CircularQueueArray {
    constructor(size = 5) {
        this.size = size;
        this.queue = new Array(size).fill(null);
        this.front = -1;
        this.rear = -1;
    }

    isEmpty() {
        return this.front === -1;
    }

    isFull() {
        return (this.rear + 1) % this.size === this.front;
    }

    enqueue(element) {
        if (this.isFull()) {
            return { 
                success: false, 
                message: `Queue Full!`,
                detail: `(rear + 1) % ${this.size} == front`
            };
        }

        if (this.isEmpty()) {
            this.front = 0;
        }

        this.rear = (this.rear + 1) % this.size;
        this.queue[this.rear] = element;
        
        return { 
            success: true, 
            message: `Added ${element}`,
            detail: `Position: ${this.rear}`
        };
    }

    dequeue() {
        if (this.isEmpty()) {
            return { 
                success: false, 
                message: `Queue Empty!`,
                detail: `No elements to remove`
            };
        }

        const element = this.queue[this.front];
        this.queue[this.front] = null;

        if (this.front === this.rear) {
            this.front = -1;
            this.rear = -1;
            return { 
                success: true, 
                message: `Removed ${element}`,
                detail: `Queue is now empty`
            };
        }

        const prevFront = this.front;
        this.front = (this.front + 1) % this.size;
        
        return { 
            success: true, 
            message: `Removed ${element}`,
            detail: `From index: ${prevFront}`
        };
    }

    getNextIndex() {
        if (this.isEmpty()) return 0;
        return (this.rear + 1) % this.size;
    }

    peek() {
        if (this.isEmpty()) {
            return { 
                success: false, 
                message: `Queue Empty!`,
                detail: `No element to peek`,
                element: null
            };
        }
        return { 
            success: true, 
            message: `Front Element: ${this.queue[this.front]}`,
            detail: `At index: ${this.front}`,
            element: this.queue[this.front]
        };
    }

    reset() {
        this.queue = new Array(this.size).fill(null);
        this.front = -1;
        this.rear = -1;
    }

    getSize() {
        if (this.isEmpty()) return 0;
        if (this.rear >= this.front) return this.rear - this.front + 1;
        return this.size - this.front + this.rear + 1;
    }
}

// ==================== Circular Queue Linked List Implementation ====================
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

class CircularQueueLinkedList {
    constructor() {
        this.front = null;
        this.rear = null;
    }

    isEmpty() {
        return this.front === null;
    }

    enqueue(element) {
        const newNode = new Node(element);

        if (this.isEmpty()) {
            this.front = newNode;
            this.rear = newNode;
            this.rear.next = this.front;
            return { 
                success: true, 
                message: `Added ${element}`,
                detail: `As first node`
            };
        }

        this.rear.next = newNode;
        this.rear = newNode;
        this.rear.next = this.front;
        
        return { 
            success: true, 
            message: `Added ${element}`,
            detail: `Rear → Front link updated`
        };
    }

    dequeue() {
        if (this.isEmpty()) {
            return { 
                success: false, 
                message: `Queue Empty!`,
                detail: `No elements to remove`
            };
        }

        const element = this.front.data;

        if (this.front === this.rear) {
            this.front = null;
            this.rear = null;
            return { 
                success: true, 
                message: `Removed ${element}`,
                detail: `Queue is now empty`
            };
        }

        this.front = this.front.next;
        this.rear.next = this.front;
        
        return { 
            success: true, 
            message: `Removed ${element}`,
            detail: `Front updated + link fixed`
        };
    }

    reset() {
        this.front = null;
        this.rear = null;
    }

    getSize() {
        if (this.isEmpty()) return 0;
        let count = 1;
        let current = this.front;
        while (current.next !== this.front) {
            count++;
            current = current.next;
        }
        return count;
    }

    peek() {
        if (this.isEmpty()) {
            return { 
                success: false, 
                message: `Queue Empty!`,
                detail: `No element to peek`,
                element: null
            };
        }
        return { 
            success: true, 
            message: `Front Element: ${this.front.data}`,
            detail: `First node`,
            element: this.front.data
        };
    }

    getAllNodes() {
        if (this.isEmpty()) return [];
        const nodes = [];
        let current = this.front;
        do {
            nodes.push(current);
            current = current.next;
        } while (current !== this.front);
        return nodes;
    }
}

// ==================== Global State ====================
let currentMode = 'array';
let arrayQueue = new CircularQueueArray(5);
let linkedListQueue = new CircularQueueLinkedList();

// ==================== Log & UI Functions ====================
function addLog(message, detail, type = 'info') {
    const logContainer = document.getElementById('logContainer');
    const logEntry = document.createElement('div');
    
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `
        <span class="log-icon">${getLogIcon(type)}</span>
        <div class="log-text">
            <p class="log-msg">${message}</p>
            ${detail ? `<p class="log-detail">${detail}</p>` : ''}
        </div>
    `;

    logContainer.insertBefore(logEntry, logContainer.firstChild);

    while (logContainer.children.length > 15) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

function getLogIcon(type) {
    const icons = { 'info': 'ℹ️', 'success': '✅', 'error': '❌' };
    return icons[type] || '•';
}

function updateStatusPanel() {
    const mode = currentMode === 'array' ? 'Array' : 'Linked List';
    const size = currentMode === 'array' ? arrayQueue.getSize() : linkedListQueue.getSize();
    const capacity = currentMode === 'array' ? arrayQueue.size : '∞';
    
    let state = 'Empty';
    if (size > 0) {
        state = (currentMode === 'array' && arrayQueue.isFull()) ? 'Full' : 'Active';
    }

    document.getElementById('statusMode').textContent = mode;
    document.getElementById('statusCount').textContent = size;
    document.getElementById('statusState').textContent = state;
    document.getElementById('statusCap').textContent = capacity;
}

function updateWorkingSection(message, code) {
    const workingStep = document.getElementById('workingStep');
    const workingCode = document.getElementById('workingCode');
    const stepNumber = workingStep.querySelector('.step-number');
    const stepTitle = workingStep.querySelector('.step-title');
    const stepDesc = workingStep.querySelector('.step-desc');
    
    if (currentMode === 'array') {
        const size = arrayQueue.getSize();
        const front = arrayQueue.front === -1 ? '-' : arrayQueue.front;
        const rear = arrayQueue.rear === -1 ? '-' : arrayQueue.rear;
        
        stepTitle.textContent = message;
        if (size === 0) {
            stepDesc.textContent = 'Queue is empty. Ready for operations.';
            workingCode.innerHTML = `<code>front = -1, rear = -1</code>`;
        } else if (arrayQueue.isFull()) {
            stepDesc.textContent = 'Queue is completely full. Cannot add more elements.';
            workingCode.innerHTML = `<code>(rear + 1) % ${arrayQueue.size} == front (true)</code>`;
        } else {
            stepDesc.textContent = `Elements in queue: ${size}. FRONT at [${front}], REAR at [${rear}]`;
            workingCode.innerHTML = `<code>front = ${front}, rear = ${rear}, size = ${size}</code>`;
        }
    } else {
        const size = linkedListQueue.getSize();
        stepTitle.textContent = message;
        if (size === 0) {
            stepDesc.textContent = 'Linked List is empty. Ready for operations.';
            workingCode.innerHTML = `<code>front = null, rear = null</code>`;
        } else {
            stepDesc.textContent = `Elements in queue: ${size}. Circular link: Yes`;
            workingCode.innerHTML = `<code>Nodes: ${size}, Circular: Yes</code>`;
        }
    }
}

// ==================== Array Queue Visualization ====================
function drawArrayQueue() {
    const canvas = document.getElementById('arrayCanvas');
    const svgNS = 'http://www.w3.org/2000/svg';
    
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    const defs = document.createElementNS(svgNS, 'defs');
    
    // Green arrow for Front
    const markerFront = document.createElementNS(svgNS, 'marker');
    markerFront.setAttribute('id', 'arrowFront');
    markerFront.setAttribute('markerWidth', '10');
    markerFront.setAttribute('markerHeight', '10');
    markerFront.setAttribute('refX', '9');
    markerFront.setAttribute('refY', '3');
    markerFront.setAttribute('orient', 'auto');
    const posFront = document.createElementNS(svgNS, 'polygon');
    posFront.setAttribute('points', '0 0, 10 3, 0 6');
    posFront.setAttribute('fill', '#10b981');
    markerFront.appendChild(posFront);
    defs.appendChild(markerFront);

    // Orange arrow for Rear
    const markerRear = document.createElementNS(svgNS, 'marker');
    markerRear.setAttribute('id', 'arrowRear');
    markerRear.setAttribute('markerWidth', '10');
    markerRear.setAttribute('markerHeight', '10');
    markerRear.setAttribute('refX', '9');
    markerRear.setAttribute('refY', '3');
    markerRear.setAttribute('orient', 'auto');
    const posRear = document.createElementNS(svgNS, 'polygon');
    posRear.setAttribute('points', '0 0, 10 3, 0 6');
    posRear.setAttribute('fill', '#f97316');
    markerRear.appendChild(posRear);
    defs.appendChild(markerRear);

    canvas.appendChild(defs);

    const boxWidth = Math.max(50, Math.min(90, 600 / arrayQueue.size - 8));
    const boxHeight = 80;
    const spacing = 8;
    const startX = (700 - (arrayQueue.size * boxWidth + (arrayQueue.size - 1) * spacing)) / 2;
    const startY = 80;

    // Draw boxes
    for (let i = 0; i < arrayQueue.size; i++) {
        const x = startX + i * (boxWidth + spacing);
        const y = startY;

        let fillColor = '#334155';
        let strokeColor = '#64748b';

        if (arrayQueue.queue[i] !== null) {
            fillColor = '#1f3a93';
            strokeColor = '#3b82f6';
        }

        if (i === arrayQueue.front) {
            fillColor = '#064e3b';
            strokeColor = '#10b981';
        }
        if (i === arrayQueue.rear) {
            fillColor = '#7c2d12';
            strokeColor = '#f97316';
        }

        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', boxWidth);
        rect.setAttribute('height', boxHeight);
        rect.setAttribute('fill', fillColor);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', '2.5');
        rect.setAttribute('rx', '6');
        canvas.appendChild(rect);

        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x + boxWidth / 2);
        text.setAttribute('y', y + boxHeight / 2 + 6);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '20');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#e2e8f0');
        text.setAttribute('font-family', 'Courier New, monospace');

        if (arrayQueue.queue[i] !== null) {
            text.textContent = arrayQueue.queue[i];
        } else {
            text.setAttribute('font-size', '14');
            text.setAttribute('fill', '#94a3b8');
            text.textContent = '-';
        }
        canvas.appendChild(text);

        // Index label
        const indexLabel = document.createElementNS(svgNS, 'text');
        indexLabel.setAttribute('x', x + boxWidth / 2);
        indexLabel.setAttribute('y', y + boxHeight + 22);
        indexLabel.setAttribute('text-anchor', 'middle');
        indexLabel.setAttribute('font-size', '12');
        indexLabel.setAttribute('fill', '#94a3b8');
        indexLabel.setAttribute('font-weight', 'bold');
        indexLabel.textContent = `[${i}]`;
        canvas.appendChild(indexLabel);
    }

    // Front pointer
    if (arrayQueue.front !== -1) {
        const frontX = startX + arrayQueue.front * (boxWidth + spacing) + boxWidth / 2;
        const frontY = startY - 50;

        const frontLine = document.createElementNS(svgNS, 'line');
        frontLine.setAttribute('x1', frontX);
        frontLine.setAttribute('y1', frontY + 15);
        frontLine.setAttribute('x2', frontX);
        frontLine.setAttribute('y2', startY - 5);
        frontLine.setAttribute('stroke', '#059669');
        frontLine.setAttribute('stroke-width', '3');
        frontLine.setAttribute('stroke-dasharray', '5,5');
        frontLine.setAttribute('marker-end', 'url(#arrowFront)');
        canvas.appendChild(frontLine);

        // FRONT label with background
        const labelRect = document.createElementNS(svgNS, 'rect');
        labelRect.setAttribute('x', frontX - 32);
        labelRect.setAttribute('y', frontY - 12);
        labelRect.setAttribute('width', '64');
        labelRect.setAttribute('height', '24');
        labelRect.setAttribute('fill', '#dcfce7');
        labelRect.setAttribute('stroke', '#059669');
        labelRect.setAttribute('stroke-width', '2');
        labelRect.setAttribute('rx', '4');
        canvas.appendChild(labelRect);

        const frontLabel = document.createElementNS(svgNS, 'text');
        frontLabel.setAttribute('x', frontX);
        frontLabel.setAttribute('y', frontY + 5);
        frontLabel.setAttribute('text-anchor', 'middle');
        frontLabel.setAttribute('dominant-baseline', 'middle');
        frontLabel.setAttribute('font-size', '12');
        frontLabel.setAttribute('font-weight', 'bold');
        frontLabel.setAttribute('fill', '#059669');
        frontLabel.textContent = 'FRONT';
        canvas.appendChild(frontLabel);
    }

    // Rear pointer
    if (arrayQueue.rear !== -1) {
        const rearX = startX + arrayQueue.rear * (boxWidth + spacing) + boxWidth / 2;
        const rearY = startY + boxHeight + 50;

        const rearLine = document.createElementNS(svgNS, 'line');
        rearLine.setAttribute('x1', rearX);
        rearLine.setAttribute('y1', startY + boxHeight + 5);
        rearLine.setAttribute('x2', rearX);
        rearLine.setAttribute('y2', rearY - 15);
        rearLine.setAttribute('stroke', '#ea580c');
        rearLine.setAttribute('stroke-width', '3');
        rearLine.setAttribute('stroke-dasharray', '5,5');
        rearLine.setAttribute('marker-end', 'url(#arrowRear)');
        canvas.appendChild(rearLine);

        // REAR label with background
        const labelRect = document.createElementNS(svgNS, 'rect');
        labelRect.setAttribute('x', rearX - 28);
        labelRect.setAttribute('y', rearY - 5);
        labelRect.setAttribute('width', '56');
        labelRect.setAttribute('height', '24');
        labelRect.setAttribute('fill', '#ffedd5');
        labelRect.setAttribute('stroke', '#ea580c');
        labelRect.setAttribute('stroke-width', '2');
        labelRect.setAttribute('rx', '4');
        canvas.appendChild(labelRect);

        const rearLabel = document.createElementNS(svgNS, 'text');
        rearLabel.setAttribute('x', rearX);
        rearLabel.setAttribute('y', rearY + 5);
        rearLabel.setAttribute('text-anchor', 'middle');
        rearLabel.setAttribute('dominant-baseline', 'middle');
        rearLabel.setAttribute('font-size', '12');
        rearLabel.setAttribute('font-weight', 'bold');
        rearLabel.setAttribute('fill', '#ea580c');
        rearLabel.textContent = 'REAR';
        canvas.appendChild(rearLabel);
    }

    // Update info display
    document.getElementById('arrayFront').textContent = arrayQueue.front === -1 ? '-' : arrayQueue.front;
    document.getElementById('arrayRear').textContent = arrayQueue.rear === -1 ? '-' : arrayQueue.rear;
    document.getElementById('arraySize').textContent = arrayQueue.getSize();
    document.getElementById('arrayNext').textContent = arrayQueue.isEmpty() ? '-' : arrayQueue.getNextIndex();
    document.getElementById('capacityBadge').textContent = `${arrayQueue.getSize()}/${arrayQueue.size}`;
}

// ==================== Linked List Queue Visualization ====================
function drawLinkedListQueue() {
    const canvas = document.getElementById('linkedListCanvas');
    const svgNS = 'http://www.w3.org/2000/svg';

    // Clear canvas
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    // Add defs with arrow markers
    const defs = document.createElementNS(svgNS, 'defs');
    
    // Blue arrow for forward links
    const markerArrow = document.createElementNS(svgNS, 'marker');
    markerArrow.setAttribute('id', 'arrowhead');
    markerArrow.setAttribute('markerWidth', '10');
    markerArrow.setAttribute('markerHeight', '10');
    markerArrow.setAttribute('refX', '9');
    markerArrow.setAttribute('refY', '3');
    markerArrow.setAttribute('orient', 'auto');
    const polygon1 = document.createElementNS(svgNS, 'polygon');
    polygon1.setAttribute('points', '0 0, 10 3, 0 6');
    polygon1.setAttribute('fill', '#3b82f6');
    markerArrow.appendChild(polygon1);
    defs.appendChild(markerArrow);

    // Red arrow for circular connection
    const markerArrowRed = document.createElementNS(svgNS, 'marker');
    markerArrowRed.setAttribute('id', 'arrowhead-red');
    markerArrowRed.setAttribute('markerWidth', '10');
    markerArrowRed.setAttribute('markerHeight', '10');
    markerArrowRed.setAttribute('refX', '9');
    markerArrowRed.setAttribute('refY', '3');
    markerArrowRed.setAttribute('orient', 'auto');
    const polygon2 = document.createElementNS(svgNS, 'polygon');
    polygon2.setAttribute('points', '0 0, 10 3, 0 6');
    polygon2.setAttribute('fill', '#ef4444');
    markerArrowRed.appendChild(polygon2);
    defs.appendChild(markerArrowRed);

    // Add CSS animation style
    const style = document.createElementNS(svgNS, 'style');
    style.textContent = `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .node-circle { animation: pulse 2s infinite; }
    `;
    defs.appendChild(style);
    canvas.appendChild(defs);

    if (linkedListQueue.isEmpty()) {
        const emptyText = document.createElementNS(svgNS, 'text');
        emptyText.setAttribute('x', '350');
        emptyText.setAttribute('y', '210');
        emptyText.setAttribute('text-anchor', 'middle');
        emptyText.setAttribute('dominant-baseline', 'middle');
        emptyText.setAttribute('font-size', '22');
        emptyText.setAttribute('fill', '#cbd5e1');
        emptyText.setAttribute('font-weight', '600');
        emptyText.textContent = '📭 Linked List is Empty';
        canvas.appendChild(emptyText);

        document.getElementById('llFront').textContent = '-';
        document.getElementById('llRear').textContent = '-';
        document.getElementById('llSize').textContent = '0';
        document.getElementById('llSizeBadge').textContent = '0 nodes';
        document.getElementById('llCircular').textContent = '❌';
        return;
    }

    const nodes = linkedListQueue.getAllNodes();
    const size = nodes.length;
    const nodePositions = {};

    // Dynamic node radius based on number of nodes
    let nodeRadius;
    let circleRadius;
    
    if (size <= 3) {
        nodeRadius = 42;
        circleRadius = 120;
    } else if (size <= 6) {
        nodeRadius = 36;
        circleRadius = 130;
    } else if (size <= 10) {
        nodeRadius = 30;
        circleRadius = 140;
    } else {
        nodeRadius = 24;
        circleRadius = 150;
    }

    // Determine layout: circular for 3+ nodes, horizontal for 1-2 nodes
    const useCircularLayout = size >= 3;
    const centerX = 350;
    const centerY = 220;

    // Calculate node positions
    if (useCircularLayout) {
        // Circular layout
        nodes.forEach((node, index) => {
            const angle = (index / size) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + circleRadius * Math.cos(angle);
            const y = centerY + circleRadius * Math.sin(angle);
            nodePositions[node.id] = { x, y, index };
        });
    } else {
        // Horizontal layout
        const startX = centerX - (size - 1) * 80;
        nodes.forEach((node, index) => {
            const x = startX + index * 160;
            const y = centerY;
            nodePositions[node.id] = { x, y, index };
        });
    }

    // Draw connection lines first (so they appear behind nodes)
    for (let i = 0; i < nodes.length - 1; i++) {
        const fromPos = nodePositions[nodes[i].id];
        const toPos = nodePositions[nodes[i + 1].id];

        if (useCircularLayout) {
            // Curved line for circular layout
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            const path = document.createElementNS(svgNS, 'path');
            const controlX = centerX + (centerX - midX) * 0.3;
            const controlY = centerY + (centerY - midY) * 0.3;
            const d = `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`;
            path.setAttribute('d', d);
            path.setAttribute('stroke', '#3b82f6');
            path.setAttribute('stroke-width', '2.5');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#arrowhead)');
            canvas.appendChild(path);
        } else {
            // Straight line for horizontal layout
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', fromPos.x + nodeRadius);
            line.setAttribute('y1', fromPos.y);
            line.setAttribute('x2', toPos.x - nodeRadius);
            line.setAttribute('y2', toPos.y);
            line.setAttribute('stroke', '#3b82f6');
            line.setAttribute('stroke-width', '2.5');
            line.setAttribute('marker-end', 'url(#arrowhead)');
            canvas.appendChild(line);
        }
    }

    // Draw circular connection from rear to front
    if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        const firstNode = nodes[0];
        const lastPos = nodePositions[lastNode.id];
        const firstPos = nodePositions[firstNode.id];

        if (useCircularLayout) {
            const path = document.createElementNS(svgNS, 'path');
            const angle1 = (nodes.length - 1) / size * 2 * Math.PI - Math.PI / 2;
            const angle2 = -Math.PI / 2;
            const controlX = centerX + (circleRadius + 60) * Math.cos((angle1 + angle2) / 2);
            const controlY = centerY + (circleRadius + 60) * Math.sin((angle1 + angle2) / 2);
            const d = `M ${lastPos.x} ${lastPos.y} Q ${controlX} ${controlY} ${firstPos.x} ${firstPos.y}`;
            path.setAttribute('d', d);
            path.setAttribute('stroke', '#ef4444');
            path.setAttribute('stroke-width', '2.5');
            path.setAttribute('stroke-dasharray', '5,5');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#arrowhead-red)');
            canvas.appendChild(path);
        } else {
            const midY = lastPos.y + 100;
            const path = document.createElementNS(svgNS, 'path');
            const d = `M ${lastPos.x - nodeRadius} ${lastPos.y} Q ${(lastPos.x + firstPos.x) / 2} ${midY} ${firstPos.x + nodeRadius} ${firstPos.y}`;
            path.setAttribute('d', d);
            path.setAttribute('stroke', '#ef4444');
            path.setAttribute('stroke-width', '2.5');
            path.setAttribute('stroke-dasharray', '5,5');
            path.setAttribute('fill', 'none');
            path.setAttribute('marker-end', 'url(#arrowhead-red)');
            canvas.appendChild(path);
        }
    }

    // Draw nodes
    nodes.forEach((node, index) => {
        const pos = nodePositions[node.id];
        const x = pos.x;
        const y = pos.y;

        // Determine colors
        let fillColor = '#93c5fd';
        let strokeColor = '#3b82f6';
        let textColor = '#ffffff';

        if (node === linkedListQueue.front) {
            fillColor = '#86efac';
            strokeColor = '#15803d';
            textColor = '#065f46';
        } else if (node === linkedListQueue.rear) {
            fillColor = '#fcd34d';
            strokeColor = '#b45309';
            textColor = '#78350f';
        }

        // Draw node circle
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', nodeRadius);
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('class', 'node-circle');
        canvas.appendChild(circle);

        // Draw node value with responsive font size
        const fontSize = nodeRadius > 35 ? '24' : nodeRadius > 28 ? '18' : '14';
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 3);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-family', 'Courier New, monospace');
        text.textContent = node.data;
        canvas.appendChild(text);

        // Draw FRONT label with maximum visibility
        if (node === linkedListQueue.front) {
            // White background box first
            const whiteBg = document.createElementNS(svgNS, 'rect');
            whiteBg.setAttribute('x', x - 38);
            whiteBg.setAttribute('y', y - nodeRadius - 32);
            whiteBg.setAttribute('width', '76');
            whiteBg.setAttribute('height', '28');
            whiteBg.setAttribute('fill', '#ffffff');
            whiteBg.setAttribute('stroke', '#059669');
            whiteBg.setAttribute('stroke-width', '3');
            whiteBg.setAttribute('rx', '5');
            canvas.appendChild(whiteBg);

            // Green arrow pointing to node
            const arrow = document.createElementNS(svgNS, 'polygon');
            arrow.setAttribute('points', `${x},${y - nodeRadius - 4} ${x - 6},${y - nodeRadius - 14} ${x + 6},${y - nodeRadius - 14}`);
            arrow.setAttribute('fill', '#059669');
            canvas.appendChild(arrow);

            // FRONT text
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', y - nodeRadius - 17);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('font-size', '14');
            label.setAttribute('font-weight', 'bold');
            label.setAttribute('fill', '#059669');
            label.setAttribute('letter-spacing', '0.5');
            label.textContent = 'FRONT';
            canvas.appendChild(label);
        }

        // Draw REAR label with maximum visibility
        if (node === linkedListQueue.rear) {
            // White background box first
            const whiteBg = document.createElementNS(svgNS, 'rect');
            whiteBg.setAttribute('x', x - 35);
            whiteBg.setAttribute('y', y + nodeRadius + 2);
            whiteBg.setAttribute('width', '70');
            whiteBg.setAttribute('height', '28');
            whiteBg.setAttribute('fill', '#ffffff');
            whiteBg.setAttribute('stroke', '#ea580c');
            whiteBg.setAttribute('stroke-width', '3');
            whiteBg.setAttribute('rx', '5');
            canvas.appendChild(whiteBg);

            // Orange arrow pointing to node
            const arrow = document.createElementNS(svgNS, 'polygon');
            arrow.setAttribute('points', `${x},${y + nodeRadius + 4} ${x - 6},${y + nodeRadius + 14} ${x + 6},${y + nodeRadius + 14}`);
            arrow.setAttribute('fill', '#ea580c');
            canvas.appendChild(arrow);

            // REAR text
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', y + nodeRadius + 17);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('font-size', '14');
            label.setAttribute('font-weight', 'bold');
            label.setAttribute('fill', '#ea580c');
            label.setAttribute('letter-spacing', '0.5');
            label.textContent = 'REAR';
            canvas.appendChild(label);
        }
    });

    // Update info display
    document.getElementById('llFront').textContent = linkedListQueue.front ? linkedListQueue.front.data : '-';
    document.getElementById('llRear').textContent = linkedListQueue.rear ? linkedListQueue.rear.data : '-';
    document.getElementById('llSize').textContent = linkedListQueue.getSize();
    document.getElementById('llSizeBadge').textContent = `${linkedListQueue.getSize()} node${linkedListQueue.getSize() !== 1 ? 's' : ''}`;
    document.getElementById('llCircular').textContent = linkedListQueue.getSize() > 0 ? '✅' : '❌';
}

// ==================== Event Listeners ====================
document.getElementById('arrayModeBtn').addEventListener('click', () => {
    currentMode = 'array';
    
    document.getElementById('arrayVisualization').classList.remove('hidden');
    document.getElementById('linkedListVisualization').classList.add('hidden');
    
    document.getElementById('arrayModeBtn').classList.add('active');
    document.getElementById('linkedListModeBtn').classList.remove('active');
    
    addLog('Switched to Array Implementation (Size: 5)', 'info', 'Fixed capacity with modulo arithmetic');
    updateStatusPanel();
    drawArrayQueue();
    updateWorkingSection('Array Mode Active', 'Fixed size array with circular queue logic');
});

document.getElementById('linkedListModeBtn').addEventListener('click', () => {
    currentMode = 'linkedList';
    
    document.getElementById('linkedListVisualization').classList.remove('hidden');
    document.getElementById('arrayVisualization').classList.add('hidden');
    
    document.getElementById('linkedListModeBtn').classList.add('active');
    document.getElementById('arrayModeBtn').classList.remove('active');
    
    addLog('Switched to Linked List Implementation (Dynamic Size)', 'info', 'Unlimited capacity with node pointers');
    updateStatusPanel();
    drawLinkedListQueue();
    updateWorkingSection('Linked List Mode Active', 'Dynamic nodes with circular linking');
});

// Set Array Size Button
document.getElementById('setSizeBtn').addEventListener('click', () => {
    const input = document.getElementById('arraySizeInput');
    const newSize = parseInt(input.value);

    if (isNaN(newSize) || newSize < 2 || newSize > 10) {
        addLog('Invalid size! Please enter a value between 2-10', 'error');
        input.value = arrayQueue.size;
        return;
    }

    if (newSize === arrayQueue.size) {
        addLog('New size is the same as current size', 'error');
        return;
    }

    const oldSize = arrayQueue.size;
    arrayQueue = new CircularQueueArray(newSize);
    document.getElementById('arraySizeInput').value = newSize;
    
    addLog(`Array size changed: ${oldSize} → ${newSize}`, 'success', `Queue cleared | New capacity: ${newSize}`);
    updateStatusPanel();
    drawArrayQueue();
});

document.getElementById('enqueueBtn').addEventListener('click', () => {
    const input = document.getElementById('enqueueInput');
    const value = parseInt(input.value);

    if (!input.value || isNaN(value) || value < 1 || value > 99) {
        addLog('Invalid input! Please enter a value between 1-99', 'error');
        return;
    }

    let result;
    if (currentMode === 'array') {
        result = arrayQueue.enqueue(value);
        if (result.success) {
            addLog(`${result.message}`, 'success', result.formula);
            drawArrayQueue();
            updateWorkingSection(`Enqueued: ${value}`, `rear = (rear + 1) % ${arrayQueue.size}`);
        } else {
            addLog(result.message, 'error', result.formula);
            updateWorkingSection('Queue is Full!', `Cannot add more elements`);
        }
    } else {
        result = linkedListQueue.enqueue(value);
        addLog(result.message, 'success', result.formula);
        drawLinkedListQueue();
        updateWorkingSection(`Enqueued: ${value}`, `New node created and linked`);
    }

    input.value = '';
    input.focus();
    updateStatusPanel();
});

document.getElementById('dequeueBtn').addEventListener('click', () => {
    let result;
    if (currentMode === 'array') {
        result = arrayQueue.dequeue();
        if (result.success) {
            addLog(result.message, 'success', result.formula);
            drawArrayQueue();
            updateWorkingSection(`Dequeued Element`, `front = (front + 1) % ${arrayQueue.size}`);
        } else {
            addLog(result.message, 'error', result.formula);
            updateWorkingSection('Empty Queue!', 'Cannot remove from empty queue');
        }
    } else {
        result = linkedListQueue.dequeue();
        if (result.success) {
            addLog(result.message, 'success', result.formula);
            drawLinkedListQueue();
            updateWorkingSection(`Dequeued Element`, 'Front node removed');
        } else {
            addLog(result.message, 'error', result.formula);
            updateWorkingSection('Empty Queue!', 'Cannot remove from empty queue');
        }
    }

    updateStatusPanel();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    arrayQueue.reset();
    linkedListQueue.reset();
    document.getElementById('enqueueInput').value = '';
    
    addLog('Queue reset to initial state', 'info', 'All elements cleared');
    
    if (currentMode === 'array') {
        drawArrayQueue();
    } else {
        drawLinkedListQueue();
    }
    
    updateStatusPanel();
    updateWorkingSection('Queue Reset', 'All elements cleared. Ready for operations.');
});

document.getElementById('peekBtn').addEventListener('click', () => {
    let result;
    if (currentMode === 'array') {
        result = arrayQueue.peek();
    } else {
        result = linkedListQueue.peek();
    }

    if (result.success) {
        addLog(result.message, 'success', result.detail);
        updateWorkingSection(`Peek Operation`, `Front element: ${result.element}`);
    } else {
        addLog(result.message, 'error', result.detail);
        updateWorkingSection('Empty Queue!', 'No element to peek');
    }
});

document.getElementById('isEmptyBtn').addEventListener('click', () => {
    let isEmpty;
    if (currentMode === 'array') {
        isEmpty = arrayQueue.isEmpty();
    } else {
        isEmpty = linkedListQueue.isEmpty();
    }

    const message = isEmpty ? `Queue is EMPTY` : `Queue is NOT empty (${currentMode} mode)`;
    const detail = isEmpty ? `All positions are null/No nodes exist` : `Contains elements`;
    const logType = isEmpty ? 'info' : 'success';

    addLog(message, logType, detail);
    updateWorkingSection(`Is Empty Check`, message);
});

document.getElementById('isFullBtn').addEventListener('click', () => {
    let result;
    if (currentMode === 'array') {
        const isFull = arrayQueue.isFull();
        const message = isFull ? `Queue is FULL` : `Queue is NOT full`;
        const detail = isFull ? `Capacity: ${arrayQueue.size}/filled` : `Available space exists`;
        const logType = isFull ? 'warning' : 'success';
        
        addLog(message, logType, detail);
        updateWorkingSection(`Is Full Check`, message);
    } else {
        addLog('Linked List has unlimited capacity', 'info', 'Never becomes full');
        updateWorkingSection(`Is Full Check`, 'Linked List: Always has capacity');
    }
});

document.getElementById('clearLogBtn').addEventListener('click', () => {
    document.getElementById('logContainer').innerHTML = '';
    addLog('Log cleared', 'info');
});

// Allow Enter key to enqueue
document.getElementById('enqueueInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('enqueueBtn').click();
    }
});

// ==================== Initialize ====================
window.addEventListener('load', () => {
    drawArrayQueue();
    addLog('Application loaded successfully', 'info', 'Ready to visualize circular queues');
    updateStatusPanel();
});

// Redraw on window resize for responsive SVGs
window.addEventListener('resize', () => {
    if (currentMode === 'array') {
        drawArrayQueue();
    } else {
        drawLinkedListQueue();
    }
});
