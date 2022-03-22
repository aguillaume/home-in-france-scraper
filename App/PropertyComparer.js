function symmetricDifference(oldProperties, newProperties) {
    let removed = [];
    let added = [];

    oldProperties.forEach(oldProp => {
        if(!newProperties.find(np => np.link == oldProp.link)) {
            console.log(`Property ${oldProp.title} has been removed.`)
            console.log(JSON.stringify(oldProp, null, 2));
            removed.push(oldProp);
        }
    })

    newProperties.forEach(newProp => {
        if(!oldProperties.find(np => np.link == newProp.link)) {
            console.log(`Property ${newProp.title} is new!!!.`)
            console.log(JSON.stringify(newProp, null, 2));
            added.push(newProp);
        }
    })

    return {
        propertiesAdded: added,
        propertiesRemoved: removed
    }
}

export { symmetricDifference };