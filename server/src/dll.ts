type Node_t = Node | undefined;

class Node
{
    value: any;
    prev: Node = this;
    next: Node = this;

    constructor(value: any, prev: Node_t, next: Node_t);
    constructor(prev: Node_t, next: Node_t);
    constructor();
    constructor(...args: any[])
    {
        if(args.length == 0)
        {
            this.prev = this;
            this.next = this;
            return;
        }
        if(args.length == 2)
        {
            this.prev = args[0];
            this.next = args[1];
            return;
        }
        if(args.length == 3)
        {
            this.value = args[0];
            this.prev = args[1];
            this.next = args[2];
            return;
        }
    }
}

export class DLL
{
    private front: Node;
    private back: Node;
    private size: number = 0;

    constructor()
    {
        this.front = new Node();
        this.back = new Node();
        this.front.next = this.back;
        this.back.prev = this.front;
    }

    get getSize()
    {
        return this.size;
    }

    push_front(value: any)
    {
        this.size++;
        const node = new Node(value, this.front, this.front.next);
        this.front.next.prev = node;
        this.front.next = node;
    }

    push_back(value: any)
    {
        this.size++;
        const node = new Node(value, this.back.prev, this.back);
        this.back.prev.next = node;
        this.back.prev = node;
    }

    pop_front()
    {
        this.size--;
        const value = this.front.next.value;
        this.front.next.next.prev = this.front;
        this.front.next = this.front.next.next;
        return value;
    }

    pop_back()
    {
        this.size--;
        const value = this.back.prev.value;
        this.back.prev.prev.next = this.back;
        this.back.prev = this.back.prev.prev;
    }

    public static iterator = class
    {
        private superThis: DLL;
        private node: Node;

        constructor(superThis: DLL)
        {
            this.superThis = superThis;
            this.node = superThis.front;
        }

        public atBack(): boolean
        {
            return this.node == this.superThis.back;
        }

        public atFront(): boolean
        {
            return this.node == this.superThis.front;
        }

        public setFront(): void
        {
            this.node = this.superThis.front.next;
        }
        
        public setBack(): void
        {
            this.node = this.superThis.back.prev;
        }

        public next(): void
        {
            this.node = this.node.next;
        }

        public prev(): void
        {
            this.node = this.node.prev;
        }

        public get(): any
        {
            return this.node.value;
        }

        public pop(dir: boolean): void //false = iterator goes left after pop; true = goes right
        {
            this.superThis.size--;
            this.node.prev.next = this.node.next;
            this.node.next.prev = this.node.prev;
            if(dir)
                this.node = this.node.next;
            else this.node = this.node.prev;
        }
    };
}