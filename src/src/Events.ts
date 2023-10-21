import type { COMPUTE_TYPE } from "./data"

type ComputeTypeEventListener = (current: COMPUTE_TYPE, prev: COMPUTE_TYPE) => void

export let events = new class Events {
   private  computeTypeListeners: ComputeTypeEventListener[] = []
    onComputeType(f: ComputeTypeEventListener) {
        this.computeTypeListeners.push(f)
    }

    dispatchComputeType(current: COMPUTE_TYPE, prev: COMPUTE_TYPE) {
        for (let f of this.computeTypeListeners) {
            f(current, prev)
        }
    }
}