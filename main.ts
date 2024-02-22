const { InputFile } = require('grammy')
const map = new Map()
const concurreny = new Map()

const CacheMedias = async (prev, method, payload, signal) => {
    let response;
    const mediaTypes = ['photo', 'audio', 'video', 'animation', 'document', 'video_note', 'voice'];
    if (method === 'sendPhoto' || method === 'sendAudio' || method === 'sendVideo' || method === 'sendAnimation' || method === 'sendDocument' || method === 'sendVideoNote' || method === 'sendVoice') {

        let media = mediaTypes.find(type => type in payload);
        if (!media) return prev(method, payload, signal)
        const mediaString = payload[media] instanceof InputFile ? payload[media].fileData : payload[media]

        if (map.has(mediaString)) {
            payload[media] = map.get(mediaString)
            response = prev(method, payload, signal)
        } else {
            if (concurreny.has(mediaString)) {
                await new Promise<void>((resolve) => {
                    const interval = setInterval(() => {
                        if (!concurreny.has(mediaString)) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 50);
                });
            } else {
                concurreny.set(mediaString, true)
            }
            response = prev(method, payload, signal)

            if (media === 'photo') {
                map.set(mediaString, (await response).result.photo[0].file_id)
            } else {
                map.set(mediaString, (await response).result[media].file_id)
            }
            concurreny.delete(mediaString)
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

        const resp = (await response).result
        if (!resp.length) {
            let type = mediaTypes.find(type => type in resp);
            if (!type) return response
            if (tempMedias[0] !== null) {
                let mediaString = tempMedias[0]
                if (type === 'photo') {
                    map.set(mediaString, resp.photo[0].file_id)
                } else {
                    map.set(mediaString, resp[type].file_id)
                }
            }
        } else {
            for (const i in resp) {
                const media = resp[i] || resp
                let type = mediaTypes.find(type => type in media);
                if (!type) return response
                if (tempMedias[i] !== null) {
                    let mediaString = tempMedias[i]
                    if (type === 'photo') {
                        map.set(mediaString, media.photo[0].file_id)
                    } else {
                        map.set(mediaString, media[type].file_id)
                    }
                }
            }
        }
    } else {
        response = prev(method, payload, signal)
    }

    return response
}

export { CacheMedias }
