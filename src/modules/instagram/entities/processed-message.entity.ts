import { CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

// processed-message.entity.ts  (takroriy webhooklardan himoya)
@Entity()
export class ProcessedMessage {
	@PrimaryColumn()
	mid: string;

	@CreateDateColumn()
	createdAt: Date;
}