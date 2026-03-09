import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCandidateDocumentsTable1710000000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'candidate_documents',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
            isUnique: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'candidateId',
            type: 'uuid',
            isNullable: false
          },
          {
            name: 'documentType',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'fileName',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'storageKey',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'rawText',
            type: 'text',
            isNullable: false
          },
          {
            name: 'uploadedAt',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()'
          }
        ]
      })
    );

    await queryRunner.createForeignKey(
      'candidate_documents',
      new TableForeignKey({
        columnNames: ['candidateId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'candidates',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'candidate_documents',
      new TableIndex({
        name: 'IDX_candidate_documents_candidateId',
        columnNames: ['candidateId']
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('candidate_documents', 'IDX_candidate_documents_candidateId');
    const table = await queryRunner.getTable('candidate_documents');
    const foreignKey = table?.foreignKeys.find(key => key.columnNames.includes('candidateId'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('candidate_documents', foreignKey);
    }
    await queryRunner.dropTable('candidate_documents');
  }
}
