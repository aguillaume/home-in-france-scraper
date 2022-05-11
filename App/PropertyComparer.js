let ctx = null;

function symmetricDifference(context, oldProperties, newProperties, propertyHistory) {
    ctx = context ?? console;
    let removed = [];
    let added = [];

    oldProperties.forEach(oldProp => {
        if(!newProperties.find(np => np.link == oldProp.link)) {
            removed.push(oldProp);
        }
    })

    newProperties.forEach(newProp => {
        const key = `${newProp.link}||${newProp.price}`;

        if(!oldProperties.find(np => np.link == newProp.link)) {
            if(propertyHistory.has(key) ) {
                let savedProp = propertyHistory.get(key);
                if(savedProp.price != newProp.price) {
                    savedProp.oldPrice =savedProp.price
                    savedProp.price = newProp.price
                    savedProp.notes = `This property price has been updated`,
                    added.push(savedProp);
                }
            } else {
                added.push(newProp);
            }
        }
    })

    return {
        propertiesAdded: {
            new: added
        },
        propertiesRemoved: removed
    }
}

module.exports = { symmetricDifference };
