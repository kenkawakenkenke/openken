
class Stats {
    constructor() {
        this.n = 0;
    }
    add(v) {
        if (this.n === 0) {
            this.min = this.max = v;
            this.sum = v;
            this.n = 1;
            return;
        }
        this.min = Math.min(this.min, v);
        this.max = Math.max(this.max, v);
        this.sum += v;
        this.n++;
    }
    get mean() {
        return this.sum / this.n;
    }
    toString() {
        return `${this.min.toFixed(2)} ~ ${this.max.toFixed(2)}, ${this.mean.toFixed(2)}`;
    }
}

export class DataBuffer {
    constructor(maxBufferSize) {
        this.buffer = [];
        for (let i = 0; i < maxBufferSize; i++) {
            this.buffer.push(0);
        }
        this.tail = 0;
    }

    add(v) {
        if (this.tail >= this.buffer.length) {
            return;
        }
        this.buffer[this.tail] = v;
        this.tail++;
    }
    clear() {
        this.tail = 0;
    }
    length() {
        return this.tail;
    }
    get(idx) {
        return this.buffer[idx];
    }
}

export function addPowerReadings(readings, dataBuffer) {
    for (let i = 0; i < readings.x.length; i++) {
        const x = readings.x[i];
        const y = readings.y[i];
        const z = readings.z[i];
        const p = Math.sqrt(x * x + y * y + z * z) - 9.81;
        dataBuffer.add(p);
    }
}

export function computeZeroCross(dataBuffer) {
    const thresh_ms2 = 1;
    let prevAbove = false;
    let zeroCross = 0;
    for (let i = 0; i < dataBuffer.length(); i++) {
        const p = dataBuffer.get(i);
        const above = p > thresh_ms2;
        if (i === 0) {
            prevAbove = above;
            continue;
        }
        if (prevAbove !== above) {
            zeroCross++;
            prevAbove = above;
        }
    }
    return zeroCross;
}