import { Logger } from "utility/Logger";

export type Listener<T> = (event: T) => any;

export interface Disposable
{
    dispose();
}

/** passes through events as they happen. You will not get events from before you start listening */
export class TypedEvent<T> {
    private listeners: Array<Listener<T>> = [];
    private listenersOncer: Array<Listener<T>> = [];

    on = (listener: Listener<T>): Disposable =>
    {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener),
        };
    }

    once = (listener: Listener<T>): void =>
    {
        this.listenersOncer.push(listener);
    }

    off = (listener: Listener<T>) =>
    {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) { this.listeners.splice(callbackIndex, 1); }
    }

    emit = async (event: T) =>
    {
        try {
            /** Update any general listeners */
            this.listeners.forEach(async function (x) {
                await x(event);
            });

            /** Clear the `once` queue */
            if (this.listenersOncer.length > 0) {
                const toCall = this.listenersOncer;
                this.listenersOncer = [];

                toCall.forEach(async function (x) {
                    await x(event);
                });
            }
        }
        catch (e) {
            Logger.error(e || "Error from TypedEvent");
        }
    }

    pipe = (te: TypedEvent<T>): Disposable =>
    {
        return this.on((e) => te.emit(e));
    }
}
