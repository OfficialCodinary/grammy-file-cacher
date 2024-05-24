import { InputFile } from "https://deno.land/x/grammy@v1.23.1/mod.ts"

type MaybePromise<T> = Promise<T> | T;

const map = new Map<string, MaybePromise<string>>()

// deno-lint-ignore no-explicit-any
async function getFileID(response: Promise<any>, media: string): Promise<string> {
    const result = await response;
    const fileId = result.result[media][media === 'photo' ? 0 : ''].file_id
    return fileId;

}

/**
 * Caches media files before making API requests.
 * 
 * Example Usage: 
 * ```ts
 * bot.api.config.use(CacheMedias())
 * ```
 * ---
 * - Api Documentation: https://github.com/OfficialCodinary/grammy-file-cacher
 * @returns {Function} The transformer function
 */

// @ts-ignore - Idk how to type this
const CacheMedias = () => async (prev, method, payload, signal) => {
    let response;
    const mediaTypes = ['photo', 'audio', 'video', 'animation', 'document', 'video_note', 'voice'];
    if (method === 'sendPhoto' || method === 'sendAudio' || method === 'sendVideo' || method === 'sendAnimation' || method === 'sendDocument' || method === 'sendVideoNote' || method === 'sendVoice') {

        const media = mediaTypes.find(type => type in payload);
        if (!media) return prev(method, payload, signal)
        const mediaString = payload[media] instanceof InputFile ? payload[media].fileData : payload[media]

        if (map.has(mediaString)) {
            payload[media] = await map.get(mediaString)
            response = prev(method, payload, signal)
        } else {
            response = prev(method, payload, signal)

            map.set(mediaString, getFileID(response, media))

        }
    } else if (method === 'sendMediaGroup' || method === 'editMessageMedia') {
        const tempMedias: string | (null)[] = []

        for (const i in payload.media) {
            const media = payload.media[i]
            const mediaString = media.media instanceof InputFile ? media.media.fileData : media.media
            if (map.has(mediaString)) {
                payload.media[i].media = map.get(mediaString)
                tempMedias.push(null);
            } else {
                tempMedias.push(mediaString)
            }

        }
        response = prev(method, payload, signal)

        const resp = response
        if (!resp.length) {
            const type = mediaTypes.find(type => type in resp);
            if (!type) return response
            if (tempMedias[0] !== null) {
                const mediaString = tempMedias[0]
                map.set(mediaString, getFileID(resp, type))
            }
        } else {
            for (const i in resp) {
                const media = resp[i] || resp
                const type = mediaTypes.find(type => type in media);
                if (!type) return response
                const mediaString = tempMedias[Number(i)]
                if (mediaString !== null) {
                    map.set(mediaString, getFileID(media, type))
                }
            }
        }
    } else {
        response = prev(method, payload, signal)
    }

    return response
}

export { CacheMedias }