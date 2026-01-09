import { DeepPartial } from '../types';

const isObject = (item: any): item is Record<string, any> => {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merges two objects.
 * properties in source override properties in target.
 * Arrays are replaced, not concatenated (usually preferred for config).
 */
export const deepMerge = <T extends object>(target: T, ...sources: DeepPartial<T>[]): T => {
    if (!sources.length) return target;

    // Merge the first source into target
    const source = sources.shift();
    if (!source) return deepMerge(target, ...sources);

    const output = { ...target };

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            const sourceKey = key as keyof typeof source;
            const targetKey = key as keyof typeof target;

            const sourceValue = source[sourceKey];
            const targetValue = target[targetKey];

            if (sourceValue === '' || sourceValue === null || sourceValue === undefined) {
                // Skip empty strings, nulls, and undefined to support inheritance 
                // (source empty means fall back to target)
                return;
            }

            if (isObject(sourceValue)) {
                if (!(sourceKey in target)) {
                    Object.assign(output, { [key]: sourceValue });
                } else if (isObject(targetValue)) {
                    (output as any)[key] = deepMerge(targetValue as object, sourceValue as any);
                } else {
                    Object.assign(output, { [key]: sourceValue });
                }
            } else {
                Object.assign(output, { [key]: sourceValue });
            }
        });
    }

    // Recursively merge remaining sources
    return deepMerge(output, ...sources);
}
