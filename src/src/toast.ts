import { toast } from '@zerodevx/svelte-toast'
export let defaultToast = (msg: string) => {
    toast.push(msg)
}

export let errorToast = (msg: string) => {
    toast.push(msg, {
        theme: {
            "--toastBackground": "rgba(255, 0, 10, 0.9)"
        },
        // initial: 0
    })
}