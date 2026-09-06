const tasks = require("../tasks/task-engine");

function createDealTasks(deal) {

    const created = [];

    created.push(
        tasks.create(
            `Review ${deal.company} opportunity`,
            "HIGH"
        )
    );

    created.push(
        tasks.create(
            `Prepare outreach for ${deal.company}`,
            "NORMAL"
        )
    );

    created.push(
        tasks.create(
            `Follow up with ${deal.company}`,
            "NORMAL"
        )
    );

    return created;
}

module.exports = {
    createDealTasks
};
