# Circular Queue Visualizer - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Array Implementation](#array-implementation)
3. [Linked List Implementation](#linked-list-implementation)
4. [Visualization Logic](#visualization-logic)
5. [Animation Effects](#animation-effects)
6. [Data Flow](#data-flow)

---

## Architecture Overview

The application is built with three main layers:

### 1. **Data Structure Layer**

- `CircularQueueArray` - Fixed size queue using modulo arithmetic
- `CircularQueueLinkedList` - Dynamic size queue using node pointers
- `Node` - Individual node for linked list elements

### 2. **Visualization Layer**

- `drawArrayQueue()` - Renders array queue as SVG boxes
- `drawLinkedListQueue()` - Renders linked list as SVG nodes and connections

### 3. **UI Layer**

- DOM manipulation for mode switching
- Event listeners for user interactions
- Dynamic display updates

---

## Array Implementation

### Data Structure

```javascript
class CircularQueueArray {
    size: number          // Fixed capacity (2-10)
    queue: Array         // Fixed-size array
    front: number        // Index of first element (-1 if empty)
    rear: number         // Index of last element (-1 if empty)
}
```

### How It Works

The array implementation uses **modulo arithmetic** to create a circular effect:

```
Array Size: 5
Initial:     front = -1, rear = -1

Enqueue 10:  front = 0, rear = 0   [10, -, -, -, -]
Enqueue 20:  front = 0, rear = 1   [10, 20, -, -, -]
Enqueue 30:  front = 0, rear = 2   [10, 20, 30, -, -]

Dequeue:     front = 1, rear = 2   [-, 20, 30, -, -]
Dequeue:     front = 2, rear = 2   [-, -, 30, -, -]

Enqueue 40:  front = 2, rear = 3   [-, -, 30, 40, -]
Enqueue 50:  front = 2, rear = 4   [-, -, 30, 40, 50]

Circular Wrap:
Enqueue 60:  rear = (4+1) % 5 = 0  [60, -, 30, 40, 50]
```

### Key Operations

#### **isEmpty()**

```javascript
isEmpty() {
    return this.front === -1;
}
```

- Returns `true` if queue is empty
- Only checks if front pointer is uninitialized

#### **isFull()**

```javascript
isFull() {
    return (this.rear + 1) % this.size === this.front;
}
```

- Checks if rear pointer (when incremented) would equal front
- This indicates no empty space remains
- The `% size` operation wraps the index circularly

#### **Enqueue (Add Element)**

```javascript
enqueue(element) {
    if (this.isFull()) return { success: false, message: "Queue Full!" };
    
    if (this.isEmpty()) {
        this.front = 0;      // Initialize front on first element
    }
    
    this.rear = (this.rear + 1) % this.size;  // Move rear circularly
    this.queue[this.rear] = element;           // Add element
    
    return { success: true, message: `Added ${element}` };
}
```

**Steps:**

1. Check if queue is full (if so, fail)
2. If empty, set front to 0
3. Increment rear with modulo wrapping
4. Place element at rear position

#### **Dequeue (Remove Element)**

```javascript
dequeue() {
    if (this.isEmpty()) return { success: false, message: "Queue Empty!" };
    
    const element = this.queue[this.front];
    this.queue[this.front] = null;              // Clear the position
    
    if (this.front === this.rear) {
        this.front = -1;  this.rear = -1;       // Queue is now empty
    } else {
        this.front = (this.front + 1) % this.size;  // Move front circularly
    }
    
    return { success: true, message: `Removed ${element}` };
}
```

**Steps:**

1. Check if queue is empty (if so, fail)
2. Store the front element
3. Clear that position
4. If front == rear, queue becomes empty (reset both to -1)
5. Otherwise, move front pointer with modulo wrapping

#### **getSize()**

```javascript
getSize() {
    if (this.isEmpty()) return 0;
    if (this.rear >= this.front) 
        return this.rear - this.front + 1;  // Non-wrapped case
    return this.size - this.front + this.rear + 1;  // Wrapped case
}
```

**Two Cases:**

- **Non-wrapped**: 0 → 1 → 2 → 3: size = 3 - 0 + 1 = 4
- **Wrapped**: 3 → 4 → [wrap] → 0 → 1: size = (5 - 3) + 1 + 1 = 4

---

## Linked List Implementation

### Data Structure

```javascript
class Node {
    data: any      // Store value
    next: Node     // Pointer to next node
    id: string     // Unique identifier for visualization
}

class CircularQueueLinkedList {
    front: Node    // Pointer to first node
    rear: Node     // Pointer to last node
}
```

### How It Works

Each node points to the next node, and the rear always points back to front:

```
Enqueue 10:
    front → [10] → front
    rear ↑_____↓ rear

Enqueue 20:
    front → [10] → [20] → front
    rear ↑___________↓ rear

Enqueue 30:
    front → [10] → [20] → [30] → front
                             ↓____↑
                         (circular link)
```

### Key Operations

#### **isEmpty()**

```javascript
isEmpty() {
    return this.front === null;
}
```

- Checks if front pointer is null

#### **Enqueue (Add Node)**

```javascript
enqueue(element) {
    const newNode = new Node(element);
    
    if (this.isEmpty()) {
        this.front = newNode;
        this.rear = newNode;
        this.rear.next = this.front;  // Self-loop for single node
        return { success: true };
    }
    
    this.rear.next = newNode;         // Link old rear to new node
    this.rear = newNode;              // Update rear
    this.rear.next = this.front;      // Rear always points to front
    
    return { success: true };
}
```

**Steps:**

1. Create new node
2. If empty, both front and rear point to this node, self-loop back
3. If not empty, link old rear to new node
4. Move rear to new node
5. Make rear point back to front (maintaining circular structure)

#### **Dequeue (Remove Node)**

```javascript
dequeue() {
    if (this.isEmpty()) return { success: false, message: "Empty!" };
    
    const element = this.front.data;
    
    if (this.front === this.rear) {
        this.front = null;  this.rear = null;  // Single node case
    } else {
        this.front = this.front.next;          // Move front forward
        this.rear.next = this.front;           // Maintain circular link
    }
    
    return { success: true, message: `Removed ${element}` };
}
```

**Steps:**

1. Check if empty
2. Store front element
3. If single node, set both to null
4. Otherwise, move front to next node and update rear's link

#### **getAllNodes()**

```javascript
getAllNodes() {
    if (this.isEmpty()) return [];
    const nodes = [];
    let current = this.front;
    do {
        nodes.push(current);
        current = current.next;
    } while (current !== this.front);  // Stop at circular wrap
    return nodes;
}
```

- Traverses the circular list using a do-while loop
- Stops when it encounters the front again (circular condition)
- Returns all nodes in order

---

## Visualization Logic

### Array Visualization: `drawArrayQueue()`

#### **1. Setup**

```javascript
const canvas = document.getElementById('arrayCanvas');
const svgNS = 'http://www.w3.org/2000/svg';
```

- Gets the SVG canvas element
- Uses SVG namespace for creating elements

#### **2. Arrow Markers**

Creates reusable arrowheads for pointing to front and rear:

```javascript
// Green arrow for front pointer
const markerFront = document.createElementNS(svgNS, 'marker');
markerFront.setAttribute('id', 'arrowFront');
// ... configure arrow shape

// Orange arrow for rear pointer
const markerRear = document.createElementNS(svgNS, 'marker');
markerRear.setAttribute('id', 'arrowRear');
// ... configure arrow shape
```

#### **3. Calculate Dimensions**

```javascript
const boxWidth = Math.max(50, Math.min(90, 600 / arrayQueue.size - 8));
const boxHeight = 80;
const spacing = 8;
const startX = (700 - (arrayQueue.size * boxWidth + (arrayQueue.size - 1) * spacing)) / 2;
const startY = 80;
```

- Dynamically sizes boxes based on array size
- Ensures responsive layout
- Centers boxes horizontally

#### **4. Draw Array Boxes**

For each element in queue:

```javascript
// Determine color based on state
let fillColor = '#334155';      // Default: empty
if (arrayQueue.queue[i] !== null) {
    fillColor = '#1f3a93';      // Filled: blue
}
if (i === arrayQueue.front) {
    fillColor = '#064e3b';      // Front: green
}
if (i === arrayQueue.rear) {
    fillColor = '#7c2d12';      // Rear: orange
}

// Draw rectangle
const rect = document.createElementNS(svgNS, 'rect');
rect.setAttribute('fill', fillColor);
// ... other attributes

// Draw value inside
const text = document.createElementNS(svgNS, 'text');
text.textContent = arrayQueue.queue[i] !== null ? arrayQueue.queue[i] : '-';

// Draw index label below
const indexLabel = document.createElementNS(svgNS, 'text');
indexLabel.textContent = `[${i}]`;
```

**Color Coding:**

- **Gray**: Empty position
- **Blue**: Contains element
- **Green**: Front pointer location
- **Orange**: Rear pointer location

#### **5. Draw Pointers**

For front pointer (if front !== -1):

```javascript
const frontX = startX + arrayQueue.front * (boxWidth + spacing) + boxWidth / 2;
const frontY = startY - 50;

// Draw line from label to box
const frontLine = document.createElementNS(svgNS, 'line');
frontLine.setAttribute('stroke-dasharray', '5,5');  // Dashed line
frontLine.setAttribute('marker-end', 'url(#arrowFront)');

// Draw label box
const labelRect = document.createElementNS(svgNS, 'rect');
labelRect.setAttribute('fill', '#dcfce7');  // Light green
labelRect.setAttribute('stroke', '#059669');

// Draw "FRONT" text
const frontLabel = document.createElementNS(svgNS, 'text');
frontLabel.textContent = 'FRONT';
```

Same process for rear pointer (below the array, orange color)

#### **6. Update Information Display**

```javascript
document.getElementById('arrayFront').textContent = arrayQueue.front;
document.getElementById('arrayRear').textContent = arrayQueue.rear;
document.getElementById('arraySize').textContent = arrayQueue.getSize();
document.getElementById('capacityBadge').textContent = `${currentSize}/${totalCapacity}`;
```

---

### Linked List Visualization: `drawLinkedListQueue()`

#### **1. Setup & Markers**

Same as array - creates blue arrow (forward links) and red arrow (circular link)

#### **2. Layout Selection**

```javascript
const useCircularLayout = size >= 3;

if (useCircularLayout) {
    // Arrange nodes in a circle
    nodes.forEach((node, index) => {
        const angle = (index / size) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + circleRadius * Math.cos(angle);
        const y = centerY + circleRadius * Math.sin(angle);
        nodePositions[node.id] = { x, y, index };
    });
} else {
    // Arrange nodes in a horizontal line
    nodes.forEach((node, index) => {
        const x = startX + index * 160;
        const y = centerY;
        nodePositions[node.id] = { x, y, index };
    });
}
```

**Dynamic Sizing:**

- **1-2 nodes**: Horizontal layout for clarity
- **3+ nodes**: Circular layout to show circularity

#### **3. Dynamic Node Sizing**

```javascript
if (size <= 3) {
    nodeRadius = 42;      // Large nodes
    circleRadius = 120;   // Close together
} else if (size <= 6) {
    nodeRadius = 36;
    circleRadius = 130;
} else if (size <= 10) {
    nodeRadius = 30;
    circleRadius = 140;
} else {
    nodeRadius = 24;      // Small nodes
    circleRadius = 150;   // Spread out
}
```

#### **4. Draw Connection Lines**

Connection from node i to node i+1:

**Circular Layout (Curved):**

```javascript
const midX = (fromPos.x + toPos.x) / 2;
const midY = (fromPos.y + toPos.y) / 2;
const path = document.createElementNS(svgNS, 'path');

// Quadratic Bezier curve with control point
const controlX = centerX + (centerX - midX) * 0.3;
const controlY = centerY + (centerY - midY) * 0.3;
const d = `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`;

path.setAttribute('d', d);
path.setAttribute('stroke', '#3b82f6');    // Blue
path.setAttribute('marker-end', 'url(#arrowhead)');  // Arrow pointing to next node
```

**Horizontal Layout (Straight):**

```javascript
const line = document.createElementNS(svgNS, 'line');
line.setAttribute('x1', fromPos.x + nodeRadius);   // Start from edge of node
line.setAttribute('x2', toPos.x - nodeRadius);     // End at edge of next node
line.setAttribute('stroke', '#3b82f6');
line.setAttribute('marker-end', 'url(#arrowhead)');
```

#### **5. Draw Circular Link (Rear to Front)**

The key feature showing circularity:

**Circular Layout:**

```javascript
// Outer arc from last node back to first
const angle1 = (nodes.length - 1) / size * 2 * Math.PI - Math.PI / 2;
const angle2 = -Math.PI / 2;  // Front node angle

// Control point on the outer perimeter
const controlX = centerX + (circleRadius + 60) * Math.cos((angle1 + angle2) / 2);
const controlY = centerY + (circleRadius + 60) * Math.sin((angle1 + angle2) / 2);

const d = `M ${lastPos.x} ${lastPos.y} Q ${controlX} ${controlY} ${firstPos.x} ${firstPos.y}`;
path.setAttribute('stroke', '#ef4444');           // Red
path.setAttribute('stroke-dasharray', '5,5');     // Dashed to show it's special
path.setAttribute('marker-end', 'url(#arrowhead-red)');
```

**Horizontal Layout:**

```javascript
// Path goes down, around, and back up
const midY = lastPos.y + 100;
const d = `M ${lastPos.x - nodeRadius} ${lastPos.y} 
           Q ${(lastPos.x + firstPos.x) / 2} ${midY} 
           ${firstPos.x + nodeRadius} ${firstPos.y}`;
```

#### **6. Draw Nodes**

For each node:

```javascript
// Determine color based on role
let fillColor = '#93c5fd';          // Default: light blue
if (node === linkedListQueue.front) {
    fillColor = '#86efac';          // Front: light green
}
if (node === linkedListQueue.rear) {
    fillColor = '#fcd34d';          // Rear: yellow
}

// Draw circle
const circle = document.createElementNS(svgNS, 'circle');
circle.setAttribute('cx', x);
circle.setAttribute('cy', y);
circle.setAttribute('r', nodeRadius);
circle.setAttribute('fill', fillColor);
circle.setAttribute('class', 'node-circle');  // For animation

// Draw value inside
const text = document.createElementNS(svgNS, 'text');
text.setAttribute('font-size', fontSize);  // Responsive size
text.textContent = node.data;

// Draw labels for front and rear nodes
if (node === linkedListQueue.front) {
    // Draw "FRONT" label above node with arrow pointing down
}
if (node === linkedListQueue.rear) {
    // Draw "REAR" label below node with arrow pointing up
}
```

---

## Animation Effects

### 1. Background Animation

**CSS Animation:**

```css
@keyframes float-orb {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(30px, -30px); }
  50% { transform: translate(-20px, 30px); }
  75% { transform: translate(30px, 20px); }
}

.gradient-orb {
  animation: float-orb 20s ease-in-out infinite;
  filter: blur(90px);
}
```

- Three gradient orbs (indigo, cyan, green)
- Smooth floating motion
- Heavy blur for subtle background effect
- Different durations and directions

#### **Orb Positioning:**

- **Orb 1 (Purple)**: Top-left, 28s delay
- **Orb 2 (Cyan)**: Bottom-right, 35s delay, reversed direction
- **Orb 3 (Green)**: Middle-right, 32s delay

### 2. Linked List Node Animation

**CSS Animation:**

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.node-circle {
  animation: pulse 2s infinite;
}
```

- Nodes gently pulse in and out
- Draws attention to node elements
- Non-distracting subtle effect

### 3. Glass Card Hover Effect

```css
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: var(--shadow-lg);
}
```

- Smoothly transitions on hover
- Custom easing for natural feel
- Shadow deepens for depth perception

### 4. Button Interactions

```css
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.3);
}
```

- Buttons move up slightly on hover
- Shadow increases for elevation effect

---

## Data Flow

### Complete Operation Flow: Enqueue

#### **User Clicks Enqueue Button**

```
1. HTML Button Element Clicked
   ↓
2. Event Listener Triggered
   document.getElementById('enqueueBtn').addEventListener('click', () => {...})
   ↓
3. Get Input Value
   const value = parseInt(document.getElementById('enqueueInput').value)
   ↓
4. Call Data Structure Method
   if (currentMode === 'array') {
       arrayQueue.enqueue(value)
   } else {
       linkedListQueue.enqueue(value)
   }
   ↓
5. Update Visualization
   if (currentMode === 'array') {
       drawArrayQueue()
   } else {
       drawLinkedListQueue()
   }
   ↓
6. Clear Input Field
   document.getElementById('enqueueInput').value = ''
```

### Array-Specific Flow

```
INPUT: 25
USER ACTION: Click Enqueue
   ↓
1. CHECK FULL: (rear + 1) % 5 === front?
   If YES: Display error
   If NO: Continue
   ↓
2. MODIFY QUEUE:
   rear = (rear + 1) % 5
   queue[rear] = 25
   ↓
3. REDRAW VISUALIZATION:
   - Clear previous SVG
   - Draw all boxes with new colors
   - Position front/rear pointers
   - Show index labels
   ↓
4. UPDATE INFO DISPLAY:
   - arrayFront: 0
   - arrayRear: 2
   - arraySize: 3
   - capacityBadge: 3/5
   ↓
RESULT: SVG updates with new element shown in blue, REAR pointer highlighted in orange
```

### Linked List-Specific Flow

```
INPUT: 25
USER ACTION: Click Enqueue
   ↓
1. CHECK EMPTY: front === null?
   If YES: First node - set front & rear to same node, self-loop
   If NO: Continue
   ↓
2. CREATE NEW NODE:
   newNode = new Node(25)
   uniqueID = random string
   ↓
3. UPDATE LINKS:
   rear.next = newNode
   rear = newNode
   rear.next = front (maintain circular)
   ↓
4. DETERMINE LAYOUT:
   total nodes >= 3? → Use circular
   total nodes < 3? → Use horizontal
   ↓
5. RECALCULATE POSITIONS:
   if circular: nodes arranged in circle with angle calculations
   if horizontal: nodes in straight line
   ↓
6. REDRAW VISUALIZATION:
   - Clear previous SVG
   - Draw connection lines (curves/straight)
   - Draw circular link (red dashed outer arc)
   - Draw nodes with colors
   - Add FRONT/REAR labels
   ↓
7. ANIMATE NODES:
   CSS pulse animation starts on new node
   ↓
RESULT: SVG updates with new node connected, animation begins
```

---

## Performance Considerations

### Array Implementation

- **Time Complexity**: O(1) for all operations
- **Space Complexity**: O(n) where n = size
- **Best For**: Fixed capacity, predictable memory, simple operations

### Linked List Implementation

- **Time Complexity**: O(1) for all operations
- **Space Complexity**: O(n) where n = current count
- **Best For**: Dynamic size, flexible capacity, unknown queue depth

### Visualization Performance

- **SVG Rendering**: Complete redraw on each operation
- **Optimization**: No change detection - always redraws for consistency
- **Scaling**: Works smoothly up to ~20 nodes before performance degrades

---

## Color Scheme

### Array Visualization

| Color | Meaning |
|-------|---------|
| **Gray (#334155)** | Empty position |
| **Blue (#1f3a93)** | Contains element |
| **Green (#064e3b)** | Front pointer |
| **Orange (#7c2d12)** | Rear pointer |

### Linked List Visualization

| Color | Type |
|-------|------|
| **Blue (#93c5fd)** | Normal node |
| **Green (#86efac)** | Front node |
| **Yellow (#fcd34d)** | Rear node |
| **Blue arrow** | Normal connection |
| **Red dashed arrow** | Circular link (rear → front) |

---

## Getting Started Variables

- `currentMode`: 'array' or 'linkedList'
- `arrayQueue`: Instance of CircularQueueArray (size 5)
- `linkedListQueue`: Instance of CircularQueueLinkedList (empty)
- `SVG Canvas Size`: 700 x 320 (array), 700 x 420 (linked list)
