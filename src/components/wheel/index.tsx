import React, { useEffect, useState } from 'react';

import './index.css';

interface Props {
    items: string[];
    onSelectItem: Function | undefined;
    selected_item :number | null
}

export default function Wheel({ items, onSelectItem ,selected_item}: Props) {
    const [selectedItem, setSelectedItem] = useState<number | null>(selected_item);
    const [spinning, setSpinning] = useState<'spinning' | ''>('');
    const [wheelVars, setwheelVars] = useState<any>({});

    useEffect(() => {
        setSpinning(selectedItem !== null ? 'spinning' : '');
        setwheelVars({
            '--nb-item': items.length,
            '--selected-item': selectedItem,
        })
        console.log('selectredd ' ,selected_item);
        
    }, [selectedItem])

    const spin_wheel = () => {
        if (selectedItem === null) {
            if (onSelectItem) {
                onSelectItem(selected_item);
            }
            setSelectedItem(selected_item)
        } else {
            setSelectedItem(null)
            setTimeout(spin_wheel, 500);
        }
    }

    return (
        <div className="wheel-container">
            <div className={`wheel ${spinning}`} style={wheelVars}>
                {items.map((item, index) => {
                    const item_num: any = {
                        '--item-nb': index
                    }
                    return (
                        <div className="wheel-item" key={index} style={item_num}>
                            {item}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}