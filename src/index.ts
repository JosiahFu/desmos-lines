import fs from 'fs';

class Point {
    x: number;
    y: number;
    static regex = /\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)/;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    static from(pointString: string) {
        const results = this.regex.exec(pointString);
        if (results != null) {
            return new Point(parseFloat(results[1]), parseFloat(results[2]));
        }
        return new Point(0,0);
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

const swap = <T>(a: T, b: T, condition: boolean): [T, T] => condition ? [b, a] : [a, b];

// When the arrow declaration is as long as the function itself
const genEquation = (point1: Point, point2: Point, func: (a: number) => number, printFunc: (a: string) => string, inverted: boolean, opposite: boolean): string => {
    // This syntax was kind of sketchy already
   let [[x1, y1], [x2, y2]] = swap(swap(point1.x, point1.y, inverted), swap(point2.x, point2.y, inverted), opposite); 
   //y=a*f(x-h)+k
   // Hmmm needs more nested string literals
   return `${inverted ? 'x' : 'y'}=${(y2-y1) / func(x2-x1)}${printFunc(`${inverted ? 'y' : 'x'}-${x1}`)}+${y1}\\left\\{${Math.min(x1,x2)}<${inverted ? 'y' : 'x'}<${Math.max(x1,x2)}\\right\\}`;
};

const calcLine = (point1: Point, point2: Point, type: string) => {
    if (type == 'Linear') {
        if (point1.x == point2.x) {
            return `x=${point1.x}\\left\\{${Math.min(point1.y,point2.y)}<y<${Math.max(point1.y,point2.y)}\\right\\}`;
        } else if (point1.y == point2.y) {
            return `y=${point1.y}\\left\\{${Math.min(point1.x,point2.x)}<x<${Math.max(point1.x,point2.x)}\\right\\}`;
        } else{
            const m = (point1.y - point2.y) / (point1.x - point2.x);
            return `y=${m}x+${point1.y - m*point1.x}\\left\\{${Math.min(point1.x,point2.x)}<x<${Math.max(point1.x,point2.x)}\\right\\}`;
        }
    }

    const opts = type.split(' ');
    const command = opts.shift();
    const inverted = opts.includes('-i');
    const opposite = opts.includes('-o');

    let func: (a: number) => number;
    let printFunc: (a: string) => string;

    switch (command) {
        case 'Quadratic':
            func = (a) => Math.pow(a, 2);
            printFunc = (a) => `\\left(${a}\\right)^{2}`;
            break;
        case 'Cubic':
            func = (a) => Math.pow(a,3);
            printFunc = (a) => `\\left(${a}\\right)^{3}`;
            break;
        default:
            return '';
    }
    return genEquation(point1, point2, func, printFunc, inverted, opposite);
}

fs.readFile('./points.txt', 'utf8', (err: any, data: string) => {
    let text_expressions = data.split('\n\n');
    let expressions = text_expressions.map(i => (i.match(/.*(?= @)/) ?? [i])[0]).filter(i => i != null);
    for (let i = 0; i < expressions.length; i++) {
        if(!Point.regex.test(expressions[i])) continue;
        if(!Point.regex.test(expressions[i+2])) continue;
        if (!/".*"/.test(expressions[i+1])) continue;

        let point1 = Point.from(expressions[i]);
        let point2 = Point.from(expressions[i+2]);
        let type = (/"(.*)"/.exec(expressions[i+1]) ?? [''] )[1];

        //console.log(point1, type, point2);

        console.log(calcLine(point1, point2, type));

    }
});