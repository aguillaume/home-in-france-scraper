let ctx = null;

function symmetricDifference(context, oldProperties, newProperties, propertyHistory) {
    ctx = context ?? console;
    let removed = [];
    let added = [];
    let reAdded = [];

    oldProperties.forEach(oldProp => {
        if(!newProperties.find(np => np.link == oldProp.link)) {
            // ctx.log(`Property ${oldProp.title} has been removed.`)
            // ctx.log(JSON.stringify(oldProp, null, 2));
            removed.push(oldProp);
        }
    })

    newProperties.forEach(newProp => {
        const key = `${newProp.link}||${newProp.price}`;

        if(!oldProperties.find(np => np.link == newProp.link)) {
            if(propertyHistory.has(key)) {
                reAdded.push({
                    notes: `This property has been added before, see comparison between 'now' and 'before' `,
                    now: newProp,
                    before: propertyHistory.get(key)
                })
            } else {
                // ctx.log(`Property ${newProp.title} is new!!!.`)
                // ctx.log(JSON.stringify(newProp, null, 2));
                added.push(newProp);
            }
        }
    })

    return {
        propertiesAdded: {
            new: added,
            reAdded: reAdded
        },
        propertiesRemoved: removed
    }
}

module.exports = { symmetricDifference };