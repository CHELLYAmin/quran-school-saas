const { Client } = require('pg');

async function updateCmsMenu() {
    const client = new Client({
        connectionString: "postgresql://postgres:'&Kakashi123'@quranschool-db.cjcuksm4yuo2.ca-central-1.rds.amazonaws.com:5432/postgres"
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const updates = [
            { slug: 'historique', title: 'Historique', show: true, order: 1 },
            { slug: 'services', title: 'Services', show: true, order: 2 },
            { slug: 'islam', title: 'Islam', show: true, order: 3 },
            { slug: 'cimetiere', title: 'Cimetière', show: true, order: 4 },
            { slug: 'ramadan-2026', title: 'Actualités', show: true, order: 5 }
        ];

        for (const up of updates) {
            const res = await client.query(
                'UPDATE "CmsPages" SET "Title" = $1, "ShowInMenu" = $2, "SortOrder" = $3 WHERE "Slug" = $4',
                [up.title, up.show, up.order, up.slug]
            );
            console.log(`Updated ${up.slug}: ${res.rowCount} row(s) affected`);
        }

        // Deactivate other pages from menu
        const resClean = await client.query(
            'UPDATE "CmsPages" SET "ShowInMenu" = false WHERE "Slug" NOT IN ($1, $2, $3, $4, $5)',
            ['historique', 'services', 'islam', 'cimetiere', 'ramadan-2026']
        );
        console.log(`Deactivated other pages: ${resClean.rowCount} row(s) affected`);

    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await client.end();
    }
}

updateCmsMenu();
