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

// Node class for linked list
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

// Global state
let currentMode = 'array';
let arrayQueue = new CircularQueueArray(5);
let linkedListQueue = new CircularQueueLinkedList();

function getQueueSnapshot() {
    if (currentMode === 'array') {
        return `size=${arrayQueue.getSize()}/${arrayQueue.size}, front=${arrayQueue.front === -1 ? '-' : arrayQueue.front}, rear=${arrayQueue.rear === -1 ? '-' : arrayQueue.rear}, empty=${arrayQueue.isEmpty() ? 'yes' : 'no'}, full=${arrayQueue.isFull() ? 'yes' : 'no'}`;
    }
    return `nodes=${linkedListQueue.getSize()}, front=${linkedListQueue.front ? linkedListQueue.front.data : '-'}, rear=${linkedListQueue.rear ? linkedListQueue.rear.data : '-'}, empty=${linkedListQueue.isEmpty() ? 'yes' : 'no'}, full=no (dynamic)`;
}

function addOperationLog(title, message, type = 'info') {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;

    const emptyState = logsContainer.querySelector('.empty-logs');
    if (emptyState) emptyState.remove();

    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    logItem.innerHTML = `
      <div class="log-header">
        <span class="log-title">${title}</span>
        <span class="log-time">${time}</span>
      </div>
      <div class="log-msg">${message}</div>
      <div class="log-state">${getQueueSnapshot()}</div>
    `;

    logsContainer.prepend(logItem);
    while (logsContainer.children.length > 20) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
}

function updateQueueStatusCard() {
    const modeEl = document.getElementById('queueModeStatus');
    const emptyEl = document.getElementById('queueEmptyStatus');
    const fullEl = document.getElementById('queueFullStatus');
    if (!modeEl || !emptyEl || !fullEl) return;

    const isArray = currentMode === 'array';
    const isEmpty = isArray ? arrayQueue.isEmpty() : linkedListQueue.isEmpty();
    const isFull = isArray ? arrayQueue.isFull() : false;

    modeEl.textContent = `Mode: ${isArray ? 'Array' : 'Linked List'}`;
    emptyEl.textContent = `Empty: ${isEmpty ? 'Yes' : 'No'}`;
    fullEl.textContent = `Full: ${isArray ? (isFull ? 'Yes' : 'No') : 'Dynamic'}`;

    emptyEl.classList.toggle('warning', isEmpty);
    emptyEl.classList.toggle('success', !isEmpty);
    fullEl.classList.toggle('warning', isArray && isFull);
    fullEl.classList.toggle('success', !isArray || !isFull);
}

// Display result on UI - stays visible until next operation
function displayResult(message, type = 'info') {
    const resultDiv = document.getElementById('operationResult');
    const resultText = document.getElementById('resultText');
    if (!resultDiv || !resultText) return;
    resultText.textContent = message;
    resultDiv.className = `operation-result ${type}`;
}

// Array Queue Visualization
function drawArrayQueue() {
    const canvas = document.getElementById('arrayCanvas');
    const svgNS = 'http://www.w3.org/2000/svg';
    
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    const defs = document.createElementNS(svgNS, 'defs');
    
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
            const displayValue = String(arrayQueue.queue[i]);
            text.textContent = displayValue.length > 4 ? `${displayValue.slice(0, 3)}…` : displayValue;
        } else {
            text.setAttribute('font-size', '14');
            text.setAttribute('fill', '#94a3b8');
            text.textContent = '-';
        }
        canvas.appendChild(text);

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

    // Dynamic Connection Arrow from REAR to FRONT
    if (!arrayQueue.isEmpty() && arrayQueue.getSize() > 1) {
        const rearX = startX + arrayQueue.rear * (boxWidth + spacing) + boxWidth / 2;
        const frontX = startX + arrayQueue.front * (boxWidth + spacing) + boxWidth / 2;
        
        const isWrapped = arrayQueue.rear < arrayQueue.front;
        const wrapPath = document.createElementNS(svgNS, 'path');
        
        // If wrapped (rear < front), curve underneath. If normal (rear > front), curve above.
        const baseY = isWrapped ? startY + boxHeight + 10 : startY - 10;
        const controlY = isWrapped ? startY + boxHeight + 90 : startY - 90;
        const midX = (rearX + frontX) / 2;
        
        // Create a smooth quadratic bezier curve
        const d = `M ${rearX} ${baseY} Q ${midX} ${controlY} ${frontX} ${baseY}`;
        
        wrapPath.setAttribute('d', d);
        wrapPath.setAttribute('stroke', '#ea580c'); // Orange to match REAR color
        wrapPath.setAttribute('stroke-width', '2.5');
        wrapPath.setAttribute('stroke-dasharray', '6,4'); // Dashed to indicate virtual link
        wrapPath.setAttribute('fill', 'none');
        wrapPath.setAttribute('marker-end', 'url(#arrowRear)'); 
        canvas.appendChild(wrapPath);

        // Add a clean label to the curve
        const wrapText = document.createElementNS(svgNS, 'text');
        wrapText.setAttribute('x', midX);
        wrapText.setAttribute('y', isWrapped ? controlY - 8 : controlY + 15);
        wrapText.setAttribute('text-anchor', 'middle');
        wrapText.setAttribute('font-size', '12');
        wrapText.setAttribute('font-weight', 'bold');
        wrapText.setAttribute('fill', '#ea580c');
        wrapText.textContent = 'Rear → Front';
        
        // Add a slight white background behind text for readability
        const textBg = document.createElementNS(svgNS, 'rect');
        textBg.setAttribute('x', midX - 45);
        textBg.setAttribute('y', isWrapped ? controlY - 18 : controlY + 5);
        textBg.setAttribute('width', '90');
        textBg.setAttribute('height', '14');
        textBg.setAttribute('fill', 'rgba(255, 255, 255, 0.7)');
        textBg.setAttribute('rx', '4');
        
        canvas.appendChild(textBg);
        canvas.appendChild(wrapText);
    }

    document.getElementById('arrayFront').textContent = arrayQueue.front === -1 ? '-' : arrayQueue.front;
    document.getElementById('arrayRear').textContent = arrayQueue.rear === -1 ? '-' : arrayQueue.rear;
    document.getElementById('arraySize').textContent = arrayQueue.getSize();
    document.getElementById('arrayNext').textContent = arrayQueue.isEmpty() ? '-' : arrayQueue.getNextIndex();
    document.getElementById('capacityBadge').textContent = `${arrayQueue.getSize()}/${arrayQueue.size}`;
    updateQueueStatusCard();
}

// Linked List Queue Visualization
function drawLinkedListQueue() {
    const canvas = document.getElementById('linkedListCanvas');
    const svgNS = 'http://www.w3.org/2000/svg';

    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    const defs = document.createElementNS(svgNS, 'defs');
    
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

    const markerArrowOrange = document.createElementNS(svgNS, 'marker');
    markerArrowOrange.setAttribute('id', 'arrowhead-orange');
    markerArrowOrange.setAttribute('markerWidth', '10');
    markerArrowOrange.setAttribute('markerHeight', '10');
    markerArrowOrange.setAttribute('refX', '9');
    markerArrowOrange.setAttribute('refY', '3');
    markerArrowOrange.setAttribute('orient', 'auto');
    const polygonOrange = document.createElementNS(svgNS, 'polygon');
    polygonOrange.setAttribute('points', '0 0, 10 3, 0 6');
    polygonOrange.setAttribute('fill', '#ff8c00');
    markerArrowOrange.appendChild(polygonOrange);
    defs.appendChild(markerArrowOrange);

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
        emptyText.setAttribute('y', '240');
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
        updateQueueStatusCard();
        return;
    }

    const nodes = linkedListQueue.getAllNodes();
    const size = nodes.length;
    const nodeRadius = size > 8 ? 24 : size > 5 ? 27 : 30;
    
    // INCREASED height and adjusted center to prevent text cutoff
    canvas.setAttribute('height', '500');
    canvas.setAttribute('viewBox', '0 0 700 500');
    const centerX = 350;
    const centerY = 250; 
    
    // SLIGHTLY smaller radius to ensure labels stay within bounds
    const circleRadius = Math.min(145, Math.max(90, 80 + size * 10));
    const nodePositions = {};

    nodes.forEach((node, index) => {
        const angle = -Math.PI / 2 + (index / size) * Math.PI * 2;
        const x = centerX + circleRadius * Math.cos(angle);
        const y = centerY + circleRadius * Math.sin(angle);
        nodePositions[node.id] = { x, y, angle };
    });

    const links = [];
    for (let i = 0; i < size; i++) {
        links.push({
            source: nodes[i],
            target: nodes[(i + 1) % size],
            isCircularLink: i === size - 1
        });
    }

    links.forEach((link) => {
        const fromPos = nodePositions[link.source.id];
        const toPos = nodePositions[link.target.id];
        const ux = (toPos.x - fromPos.x) / Math.hypot(toPos.x - fromPos.x, toPos.y - fromPos.y);
        const uy = (toPos.y - fromPos.y) / Math.hypot(toPos.x - fromPos.x, toPos.y - fromPos.y);
        const sx = fromPos.x + ux * nodeRadius;
        const sy = fromPos.y + uy * nodeRadius;
        const ex = toPos.x - ux * nodeRadius;
        const ey = toPos.y - uy * nodeRadius;

        const path = document.createElementNS(svgNS, 'path');
        
        // FIXED: The circular link now uses the EXACT same perfect arc math as the normal links!
        const d = `M ${sx} ${sy} A ${circleRadius} ${circleRadius} 0 0 1 ${ex} ${ey}`;
        
        path.setAttribute('d', d);
        path.setAttribute('stroke', link.isCircularLink ? '#ff8c00' : '#3b82f6');
        path.setAttribute('stroke-width', link.isCircularLink ? '3' : '2.4');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', link.isCircularLink ? 'url(#arrowhead-orange)' : 'url(#arrowhead)');
        canvas.appendChild(path);
    });

    // Check if we need to split labels (only 1 node exists)
    const isSingleNode = size === 1;

    nodes.forEach((node, index) => {
        const pos = nodePositions[node.id];
        const x = pos.x;
        const y = pos.y;

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

        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', nodeRadius);
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('class', 'node-circle');
        canvas.appendChild(circle);

        const fontSize = nodeRadius >= 30 ? '15' : '13';
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y + 3);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', fontSize);
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-family', 'Courier New, monospace');
        const nodeValue = String(node.data);
        text.textContent = nodeValue.length > 3 ? `${nodeValue.slice(0, 2)}…` : nodeValue;
        canvas.appendChild(text);

        if (node === linkedListQueue.front) {
            // FIXED: Prevent overlap if size is 1, and ensure label is far out enough
            const theta = isSingleNode ? pos.angle - 0.5 : pos.angle; 
            const labelOffset = 50; 
            const fx = centerX + (circleRadius + labelOffset) * Math.cos(theta);
            const fy = centerY + (circleRadius + labelOffset) * Math.sin(theta);
            
            const whiteBg = document.createElementNS(svgNS, 'rect');
            whiteBg.setAttribute('x', fx - 38);
            whiteBg.setAttribute('y', fy - 14);
            whiteBg.setAttribute('width', '76');
            whiteBg.setAttribute('height', '28');
            whiteBg.setAttribute('fill', '#ffffff');
            whiteBg.setAttribute('stroke', '#059669');
            whiteBg.setAttribute('stroke-width', '3');
            whiteBg.setAttribute('rx', '5');
            canvas.appendChild(whiteBg);

            // FIXED: Arrow correctly points to the outer edge of the node, not the center
            const arrow = document.createElementNS(svgNS, 'polygon');
            const tipX = x + Math.cos(theta) * (nodeRadius + 2);
            const tipY = y + Math.sin(theta) * (nodeRadius + 2);
            arrow.setAttribute('points', `${tipX},${tipY} ${fx - 6},${fy} ${fx + 6},${fy}`);
            arrow.setAttribute('fill', '#059669');
            canvas.appendChild(arrow);

            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', fx);
            label.setAttribute('y', fy + 3);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('font-size', '14');
            label.setAttribute('font-weight', 'bold');
            label.setAttribute('fill', '#059669');
            label.setAttribute('letter-spacing', '0.5');
            label.textContent = 'FRONT';
            canvas.appendChild(label);
        }

        if (node === linkedListQueue.rear) {
            // FIXED: Prevent overlap if size is 1, and ensure label is far out enough
            const theta = isSingleNode ? pos.angle + 0.5 : pos.angle;
            const labelOffset = 50;
            const rx = centerX + (circleRadius + labelOffset) * Math.cos(theta);
            const ry = centerY + (circleRadius + labelOffset) * Math.sin(theta);
            
            const whiteBg = document.createElementNS(svgNS, 'rect');
            whiteBg.setAttribute('x', rx - 35);
            whiteBg.setAttribute('y', ry - 14);
            whiteBg.setAttribute('width', '70');
            whiteBg.setAttribute('height', '28');
            whiteBg.setAttribute('fill', '#ffffff');
            whiteBg.setAttribute('stroke', '#ea580c');
            whiteBg.setAttribute('stroke-width', '3');
            whiteBg.setAttribute('rx', '5');
            canvas.appendChild(whiteBg);

            // FIXED: Arrow correctly points to the outer edge of the node, not the center
            const arrow = document.createElementNS(svgNS, 'polygon');
            const tipX = x + Math.cos(theta) * (nodeRadius + 2);
            const tipY = y + Math.sin(theta) * (nodeRadius + 2);
            arrow.setAttribute('points', `${tipX},${tipY} ${rx - 6},${ry} ${rx + 6},${ry}`);
            arrow.setAttribute('fill', '#ea580c');
            canvas.appendChild(arrow);

            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', rx);
            label.setAttribute('y', ry + 3);
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

    document.getElementById('llFront').textContent = linkedListQueue.front ? linkedListQueue.front.data : '-';
    document.getElementById('llRear').textContent = linkedListQueue.rear ? linkedListQueue.rear.data : '-';
    document.getElementById('llSize').textContent = linkedListQueue.getSize();
    document.getElementById('llSizeBadge').textContent = `${linkedListQueue.getSize()} node${linkedListQueue.getSize() !== 1 ? 's' : ''}`;
    document.getElementById('llCircular').textContent = linkedListQueue.getSize() > 0 ? '✅' : '❌';
    updateQueueStatusCard();
}

// Event Listeners
document.getElementById('arrayModeBtn').addEventListener('click', () => {
    currentMode = 'array';
    
    document.getElementById('arrayVisualization').classList.remove('hidden');
    document.getElementById('linkedListVisualization').classList.add('hidden');
    
    document.getElementById('arrayModeBtn').classList.add('active');
    document.getElementById('linkedListModeBtn').classList.remove('active');
    document.getElementById('arraySizeControl').classList.remove('hidden');
    
    drawArrayQueue();
    addOperationLog('Mode Switched', 'Array implementation selected.', 'info');
});

document.getElementById('linkedListModeBtn').addEventListener('click', () => {
    currentMode = 'linkedList';
    
    document.getElementById('linkedListVisualization').classList.remove('hidden');
    document.getElementById('arrayVisualization').classList.add('hidden');
    
    document.getElementById('linkedListModeBtn').classList.add('active');
    document.getElementById('arrayModeBtn').classList.remove('active');
    document.getElementById('arraySizeControl').classList.add('hidden');
    
    drawLinkedListQueue();
    addOperationLog('Mode Switched', 'Linked-list implementation selected.', 'info');
});

document.getElementById('clearLogsBtn').addEventListener('click', () => {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;
    logsContainer.innerHTML = '<div class="empty-logs">No operations performed yet.</div>';
    displayResult('🧹 Operation logs cleared.', 'info');
});

document.getElementById('setSizeBtn').addEventListener('click', () => {
    const input = document.getElementById('arraySizeInput');
    const newSize = parseInt(input.value);

    if (isNaN(newSize) || newSize < 2 || newSize > 10) {
        alert('Please enter a size between 2-10');
        input.value = arrayQueue.size;
        return;
    }

    if (newSize === arrayQueue.size) {
        alert('Size is already ' + newSize);
        return;
    }

    arrayQueue = new CircularQueueArray(newSize);
    document.getElementById('arraySizeInput').value = newSize;
    drawArrayQueue();
    addOperationLog('Set Size', `Array size changed to ${newSize}. Queue reset.`, 'warning');
});

document.getElementById('enqueueBtn').addEventListener('click', () => {
    const input = document.getElementById('enqueueInput');
    const value = input.value.trim();

    if (!value) {
        alert('Enter any non-empty value');
        return;
    }

    if (currentMode === 'array') {
        const result = arrayQueue.enqueue(value);
        if (!result.success) {
            displayResult(`❌ ${result.message}`, 'danger');
            addOperationLog('Enqueue Failed', `${result.message} ${result.detail}`, 'danger');
        } else {
            displayResult(`✅ ${result.message}`, 'success');
            addOperationLog('Enqueue', `${result.message} (${result.detail})`, 'success');
        }
        drawArrayQueue();
    } else {
        const result = linkedListQueue.enqueue(value);
        displayResult(`✅ ${result.message}`, 'success');
        addOperationLog('Enqueue', `${result.message} (${result.detail})`, 'success');
        drawLinkedListQueue();
    }

    input.value = '';
    input.focus();
});

document.getElementById('dequeueBtn').addEventListener('click', () => {
    if (currentMode === 'array') {
        const result = arrayQueue.dequeue();
        if (!result.success) {
            displayResult(`❌ ${result.message}`, 'danger');
            addOperationLog('Dequeue Failed', `${result.message} ${result.detail}`, 'danger');
        } else {
            displayResult(`✅ ${result.message}`, 'success');
            addOperationLog('Dequeue', `${result.message} (${result.detail})`, 'warning');
        }
        drawArrayQueue();
    } else {
        const result = linkedListQueue.dequeue();
        if (!result.success) {
            displayResult(`❌ ${result.message}`, 'danger');
            addOperationLog('Dequeue Failed', `${result.message} ${result.detail}`, 'danger');
        } else {
            displayResult(`✅ ${result.message}`, 'success');
            addOperationLog('Dequeue', `${result.message} (${result.detail})`, 'warning');
        }
        drawLinkedListQueue();
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    arrayQueue.reset();
    linkedListQueue.reset();
    document.getElementById('enqueueInput').value = '';
    
    if (currentMode === 'array') {
        drawArrayQueue();
    } else {
        drawLinkedListQueue();
    }
    displayResult('🔄 Queue reset completed.', 'info');
    addOperationLog('Reset', 'Queue state cleared for both implementations.', 'info');
});

document.getElementById('peekBtn').addEventListener('click', () => {
    let result;
    if (currentMode === 'array') {
        result = arrayQueue.peek();
    } else {
        result = linkedListQueue.peek();
    }

    if (result.success) {
        displayResult('👁️ Front Element: ' + result.element, 'info');
        addOperationLog('Peek', `${result.message} (${result.detail})`, 'info');
    } else {
        displayResult('❌ ' + result.message, 'danger');
        addOperationLog('Peek Failed', `${result.message} ${result.detail}`, 'danger');
    }
});

document.getElementById('isEmptyBtn').addEventListener('click', () => {
    let isEmpty;
    if (currentMode === 'array') {
        isEmpty = arrayQueue.isEmpty();
    } else {
        isEmpty = linkedListQueue.isEmpty();
    }

    const msg = isEmpty ? '✅ Queue is EMPTY' : '✖️ Queue is NOT empty';
    displayResult(msg, isEmpty ? 'warning' : 'info');
    addOperationLog('Is Empty Check', msg, isEmpty ? 'warning' : 'info');
});

document.getElementById('isFullBtn').addEventListener('click', () => {
    if (currentMode === 'array') {
        const isFull = arrayQueue.isFull();
        const msg = isFull ? '⚠️ Queue is FULL' : '✓ Queue is NOT full';
        displayResult(msg, isFull ? 'warning' : 'info');
        addOperationLog('Is Full Check', msg, isFull ? 'warning' : 'info');
    } else {
        const msg = 'ℹ️ Linked List has dynamic capacity (not fixed full)';
        displayResult(msg, 'info');
        addOperationLog('Is Full Check', msg, 'info');
    }
});

document.getElementById('enqueueInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('enqueueBtn').click();
    }
});

window.addEventListener('load', () => {
    drawArrayQueue();
    updateQueueStatusCard();
});

window.addEventListener('resize', () => {
    if (currentMode === 'array') {
        drawArrayQueue();
    } else {
        drawLinkedListQueue();
    }
});