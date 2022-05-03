import { ModelStatic, Model, CreationAttributes } from '@sequelize/core';

const datefieldTypes = ['DATE', 'DATETIME', 'DATEONLY'];

export function restoreTimestampsSequelize<M extends Model>(data: Record<string, unknown>, instance: M, model: ModelStatic<M>) {
    const attrs = model.getAttributes();

    // todo cache this process ?
    Object.values(attrs).forEach((field) => {
        const type = typeof field.type === 'string' ? field.type : field.type.key;
        if (datefieldTypes.includes(type) && 'fieldName' in field) {
            const t = field as unknown as { fieldName: string };
            if (data[t.fieldName]) {
                instance.setDataValue(t.fieldName, new Date(data[t.fieldName] as any));
            }
        }
    });
}

export function hydrateModel<V extends Model>(model: ModelStatic<V>, data: CreationAttributes<V>): V {
    const instance = model.build(data, { isNewRecord: false, raw: false });
    restoreTimestampsSequelize(data, instance, model);
    return instance;
}
