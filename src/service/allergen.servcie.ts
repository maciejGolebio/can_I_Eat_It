import https from 'https'

function doOnAllergenIfExist(
    allergenId:string,
    url: string,
    req: any,
    action: (opts?: any) => void,
    failMessage: (AllergenId: string) => string,
    actionOpts?: any) {
    https.get(url, async (allergensRes) => {
        let body = ""
        allergensRes.on("data", (chunk) => { body += chunk })
        allergensRes.on("end", async () => {
            try {
                var allergens = JSON.parse(body)
            } catch (err) {
                console.error(err)
            }
            if (!!allergens) {
                let isAllergen = await allergens.tags?.find((element: { id: string }) => element.id == allergenId) ?? false
                if (isAllergen == false) {
                    return {
                        "status": 202,
                        "body": {
                            "message": failMessage(allergenId)
                        }
                    }
                } else {
                    await action(actionOpts)
                    return {
                        "status": 201,
                        "body": {
                            "message": "saved"
                        }
                    }
                }
            } else {
                return { "status": 404 }
            }
        })
    }).on("error", (error) => {
        console.log(error.message)
        return { "status": 404 }
    })
}

export { doOnAllergenIfExist }