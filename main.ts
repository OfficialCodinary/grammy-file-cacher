const { InputFile } = require('grammy')

type MaybePromise<T> = Promise<T> | T;

const map = new Map<string, MaybePromise<string>>()

function getFileID(response, media: string): Promise<string> {
    return new Promise(async (resolve) => {
        const result = await response;
        let fileId = result.result[media][media === 'photo' ? 0 : ''].file_id
        resolve(fileId);
    })
}

const CacheMedias = () => async (prev, method, payload, signal) => {
    let response;
    const mediaTypes = ['photo', 'audio', 'video', 'animation', 'document', 'video_note', 'voice'];
    if (method === 'sendPhoto' || method === 'sendAudio' || method === 'sendVideo' || method === 'sendAnimation' || method === 'sendDocument' || method === 'sendVideoNote' || method === 'sendVoice') {

        let media = mediaTypes.find(type => type in payload);
        if (!media) return prev(method, payload, signal)
        const mediaString = payload[media] instanceof InputFile ? payload[media].fileData : payload[media]

        if (map.has(mediaString)) {
            console.log(await map.get(mediaString))
            payload[media] = await map.get(mediaString)
            response = prev(method, payload, signal)
        } else {
            response = prev(method, payload, signal)

            map.set(mediaString, getFileID(response, media))

        }
    } else if (method === 'sendMediaGroup' || method === 'editMessageMedia') {
        const tempMedias: string | null[] = []

        for (const i in payload.media) {
            const media = payload.media[i]
            let mediaString = media.media instanceof InputFile ? media.media.fileData : media.media
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
            let type = mediaTypes.find(type => type in resp);
            if (!type) return response
            if (tempMedias[0] !== null) {
                let mediaString = tempMedias[0]
                map.set(mediaString, getFileID(resp, type))
            }
        } else {
            for (const i in resp) {
                const media = resp[i] || resp
                let type = mediaTypes.find(type => type in media);
                if (!type) return response
                if (tempMedias[i] !== null) {
                    let mediaString = tempMedias[i]
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
