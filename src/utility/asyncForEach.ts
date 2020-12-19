export async function asyncForEach<T>(array: T[], callback: (elem: T, ind?: number, arr?: T[]) => void)
{
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}