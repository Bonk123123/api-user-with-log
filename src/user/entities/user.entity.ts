import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public username: string;

  @Column()
  public password: string;

  @Column()
  public updated_at: Date;

  @Column()
  public created_at: Date;
}

export default User;
