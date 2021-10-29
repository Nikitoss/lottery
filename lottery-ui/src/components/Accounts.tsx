import { Account } from "./Account";

type TProps = {
    addresses: string[];
}

export function Accounts({addresses}: TProps) {



    if (!addresses || addresses.length === 0) {
        return (<div>Список адресов пуст</div>);
    }

    return(
        <div className="">
            <h2 className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                Список выбранных адресов
            </h2>
            
            <div className="flex justify-around p-2">
                {addresses.map((address) => <Account key={address} account={address}/>)}
            </div>
        </div>
    );
}