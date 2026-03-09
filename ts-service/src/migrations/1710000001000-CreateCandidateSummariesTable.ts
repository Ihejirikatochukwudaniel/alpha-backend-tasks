import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCandidateSummariesTable1710000001000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'candidate_summaries',
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
            name: 'status',
            type: 'varchar',
            isNullable: false,
            default: `'pending'`
          },
          {
            name: 'score',
            type: 'double precision',
            isNullable: true
          },
          {
            name: 'strengths',
            type: 'text',
            isArray: true,
            isNullable: true
          },
          {
            name: 'concerns',
            type: 'text',
            isArray: true,
            isNullable: true
          },
          {
            name: 'summary',
            type: 'text',
            isNullable: true
          },
          {
            name: 'recommendedDecision',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'provider',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'promptVersion',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'errorMessage',
            type: 'text',
            isNullable: true
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()'
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            isNullable: false,
            default: 'now()'
          }
        ]
      })
    );

    await queryRunner.createForeignKey(
      'candidate_summaries',
      new TableForeignKey({
        columnNames: ['candidateId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'candidates',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createIndex(
      'candidate_summaries',
      new TableIndex({
        name: 'IDX_candidate_summaries_candidateId',
        columnNames: ['candidateId']
      })
    );

    await queryRunner.createIndex(
      'candidate_summaries',
      new TableIndex({
        name: 'IDX_candidate_summaries_status',
        columnNames: ['status']
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('candidate_summaries', 'IDX_candidate_summaries_status');
    await queryRunner.dropIndex('candidate_summaries', 'IDX_candidate_summaries_candidateId');
    const table = await queryRunner.getTable('candidate_summaries');
    const foreignKey = table?.foreignKeys.find(key => key.columnNames.includes('candidateId'));
    if (foreignKey) {
      await queryRunner.dropForeignKey('candidate_summaries', foreignKey);
    }
    await queryRunner.dropTable('candidate_summaries');
  }
}
