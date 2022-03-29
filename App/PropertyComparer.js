let ctx = null;

function symmetricDifference(context, oldProperties, newProperties) {
    ctx = context ?? console;
    let removed = [];
    let added = [];

    oldProperties.forEach(oldProp => {
        if(!newProperties.find(np => np.link == oldProp.link)) {
            ctx.log(`Property ${oldProp.title} has been removed.`)
            ctx.log(JSON.stringify(oldProp, null, 2));
            removed.push(oldProp);
        }
    })

    newProperties.forEach(newProp => {
        if(!oldProperties.find(np => np.link == newProp.link)) {
            ctx.log(`Property ${newProp.title} is new!!!.`)
            ctx.log(JSON.stringify(newProp, null, 2));
            added.push(newProp);
        }
    })

    return {
        propertiesAdded: added,
        propertiesRemoved: removed
    }
}

module.exports = { symmetricDifference };