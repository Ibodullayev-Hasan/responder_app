import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// faq-rule.entity.ts
@Entity()
export class FaqRule {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('text', { array: true })
	keywords: string[];

	@Column('text')
	answer: string;

	@Column({ default: 0 })
	priority: number; 

	@Column({ default: true })
	isActive: boolean;
}

