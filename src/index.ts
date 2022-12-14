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

class FunctionType {
    func: (a: number) => number;
    printFunc: (a: string) => string;
    constructor(func: (a: number) => number, printFunc: (a: string) => string) {
        this.func = func;
        this.printFunc = printFunc;
    }
}

const functionTypes: Record<string, FunctionType> = {
    Quadratic: new FunctionType(
        (a: number) => Math.pow(a, 2),
        (a: string) => `\\left(${a}\\right)^{2}`
    ),
    Cubic: new FunctionType(
        (a: number) => Math.pow(a,3),
        (a: string) => `\\left(${a}\\right)^{3}`
    )
};

const swap = <T>(a: T, b: T, condition: boolean): [T, T] => condition ? [b, a] : [a, b];

const genEquation = (
    point1: Point, point2: Point,
    func: (a: number) => number, printFunc: (a: string) => string,
    inverted: boolean, opposite: boolean
): string => {
    const [[x1, y1], [x2, y2]] = swap(
        swap(point1.x, point1.y, inverted),
        swap(point2.x, point2.y, inverted),
    opposite); 
    //y=a*f(x-h)+k
    const a = (y2-y1) / func(x2-x1);
    const h = x1;
    const k = y1;
    const d1 = Math.min(x1,x2);
    const d2 = Math.max(x1,x2);
    const [ind, dep] = swap('x', 'y', inverted);
    return `${dep}=${a}${printFunc(`${ind}-${h}`)}+${k}\\left\\{${d1}\\le ${ind}\\le ${d2}\\right\\}`;
};

const genLinearEquation = (point1: Point, point2: Point) => {
        if (point1.x == point2.x) {
            return `x=${point1.x}\\left\\{${Math.min(point1.y,point2.y)}\\le y\\le ${Math.max(point1.y,point2.y)}\\right\\}`;
        } else if (point1.y == point2.y) {
            return `y=${point1.y}\\left\\{${Math.min(point1.x,point2.x)}\\le x\\le ${Math.max(point1.x,point2.x)}\\right\\}`;
        } else{
            const m = (point1.y - point2.y) / (point1.x - point2.x);
            return `y=${m}x+${point1.y - m*point1.x}\\left\\{${Math.min(point1.x,point2.x)}\\le x\\le ${Math.max(point1.x,point2.x)}\\right\\}`;
        }
};

const genSqRtEquation = (point1: Point, point2: Point, inverted = false, opposite = false) => {
    if (point1.x > point2.x !== opposite) { // XOR because opposite reverses the points
        return genEquation(point1, point2, (a: number) => Math.sqrt(-a), (a: string) => `\\sqrt{-\\left(${a}\\right)}`, inverted, opposite);
    }
    return genEquation(point1, point2, (a: number) => Math.sqrt(a), (a: string) => `\\sqrt{${a}}`, inverted, opposite);
}

const calcLine = (point1: Point, point2: Point, type: string) => {
    if (type == 'Linear') {
        return genLinearEquation(point1, point2);
    }

    const opts = type.split(' ');
    const command= opts.shift();
    const inverted = opts.includes('-i');
    const opposite = opts.includes('-o');
    
    if (command == 'SquareRoot') {
        return genSqRtEquation(point1, point2, inverted, opposite);
    }

    if (command != null && command in functionTypes) {
        return genEquation(point1, point2, functionTypes[command].func, functionTypes[command].printFunc, inverted, opposite);
    }
    return '';
};

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
